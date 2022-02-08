const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const passport=require('passport');
const googleStrategy=require('passport-google-oauth2');

passport.serializeUser(function(user, done) {
    console.log("Serialize")
    console.log(user)
    if(user._id){
        console.log("USer exist in Db")
        done(null, user._id);
    }
    else {
        console.log("Google user save")
        done(null, user);
    }
});

passport.deserializeUser(function(userId, done) {
    console.log("Deserilize uid: ")
    console.log(userId)
    landlord.findById(userId)
        .then((dat)=>{
            if(dat){
                console.log("Landlord deserialize")
                console.log(dat)
                return done(null, dat);
            }
            else {
                console.log("Not in landlord")
            }
        })
        .catch(err=>{
            return done(null, userId);
        })
    tenant.findById(userId)
        .then((dat)=>{
            if(dat){
                console.log("Tenant deserialize")
                console.log(dat)
                return done(null, dat);
            }
            else {
                console.log("Not in tenant")
            }
        })
        .catch(err=>{
            return done(null, userId);
        })
    console.log("DE-Serialize")
    // return done(null, userId);
});

passport.use(new googleStrategy({
        clientID:     "788746063080-vm2a0i26sr9oqomo5i86ns5ff3nb34ts.apps.googleusercontent.com",
        clientSecret: "d8VtFHKLYpFuVbx4y3I3oiDN",
        callbackURL:process.env.AUTH_URL ,
        passReqToCallback   : true
    },
    async function(request, accessToken, refreshToken, profile, done) {
        let data
        //if user is trying to log in we check the user
        //if landlord is trying to log in we check the landlord
    if(request.session.landlordLog){
        data=await landlord.findOne({email:profile.email})
        if(data){
            // console.log(data)
            console.log("Landlord found")
            return done(null, data);
        }
        else {
            console.log("No landlord found")
            return done(null, profile);
        }
    }
    else{
        data=await tenant.findOne({email:profile.email});
        if(data){
            console.log("User found")
            return done(null, data);
        }
        else {
            console.log("No user found")
            return done(null, profile.id);
        }
    }
    }
));
/*
The user id (you provide as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

serializeUser determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}

We are calling passport.deserializeUser right after it where does it fit in the workflow?
The first argument of deserializeUser corresponds to the key of the user object that was given to the done function (see 1.). So your whole object is retrieved with help of that key. That key here is the user id (key can be any key of the user object i.e. name,email etc). In deserializeUser that key is matched with the in memory array / database or any data resource.

The fetched object is attached to the request object as req.user


passport.serializeUser(function(user, done) {
    done(null, user.id);
});              │
                 │
                 │
                 └─────────────────┬──→ saved to session
                                   │    req.session.passport.user = {id: '..'}
                                   │
                                   ↓
passport.deserializeUser(function(id, done) {
                   ┌───────────────┘
                   │
                   ↓
    User.findById(id, function(err, user) {
        done(err, user);
    });            └──────────────→ user object attaches to the request as req.user
});
 */