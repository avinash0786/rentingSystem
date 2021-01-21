console.log("Tenant notification script linked")
async function readOnMessage(obj)
{
    console.log("Read on message clicked ")
    var returned=await fetch("/updatereadon?rid="+obj.value)
    returned.json()
        .then(d=>{
            if(d.respose)
            {
                obj.innerText="OK"
                obj.disabled=true;
                obj.style.backgroundColor="green"
                console.log("Success")
            }
        }).catch(e=>{
        console.log("Error")
    })
}