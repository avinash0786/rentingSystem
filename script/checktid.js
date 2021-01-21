console.log("Check tid running")

async function checktid(){
    console.log("Checking..")
    let tid=document.getElementById("tid").value;
    let tenant=document.getElementById("tenant").value;
    if(tid==="" || tenant===""){
        console.log("No details")
        document.getElementById("req").style.display="block";
        return;
    }
    else {
        document.getElementById("req").style.display="none";
    }
    console.log(tenant+" + "+tid)
    var returned=await fetch(`/verifytid?t=${tenant}&tid=${tid}`)
    returned.json()
        .then(d=>{
            if(d.respose)
            {
                console.log(d.respose)
                console.log("Success")
                document.getElementById("success").style.display="block";
                document.getElementById("failed").style.display="none";
                location.replace(`/invoice?tid=${tid}&sec=${tenant}`)
            }
            else {
                console.log("Fail")
                document.getElementById("failed").style.display="block";
                document.getElementById("success").style.display="none";
            }
        }).catch(e=>{
        console.log("Error")
    })
}