/*const promiseA = new Promise( (resolutionFunc,rejectionFunc) => {
    resolutionFunc(777);
});
// At this point, "promiseA" is already settled.
promiseA.then( (val) => console.log("asynchronous logging has val:",val) ).then(() => console.log("NEXT executed")).then(()=>console.log("at the end executioin"));
console.log("immediate logging");*/

// produces output in this order:
// immediate logging
// asynchronous logging has val: 777
var a="apple is red"
console.log(a.slice(0,4))