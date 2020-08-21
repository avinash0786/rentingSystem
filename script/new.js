console.log("Script for tenant login , landlord exist check")

async function deleteTenant(obj){
   console.log("Delete tenent: ")
    obj.innerText="Removed"
    obj.disabled=true;
    var sending={
        val:obj.value
    }
    fetch('/landlord-removeTenant',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(sending)
    }).then(d=>{
        console.log("Delete tenant req recieved")
    }).catch(e=>{
        console.log("Error approve")
    })
}


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

async function approve(obj){
    // console.log(obj.valueOf())
    // console.log(obj.value)
    obj.innerText="Approved"
    obj.disabled=true;
    obj.nextElementSibling.style.display="none"
    var sending={
        val:obj.value
    }
    fetch('/landlord-approve',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(sending)
    }).then(d=>{
        console.log("Approve req recieved")
    }).catch(e=>{
        console.log("Error approve")
    })
}

async function cancleapprove(obj){
    obj.innerText="Discarded"
    obj.disabled=true;
    obj.previousElementSibling.style.display="none"
    var sending={
        val:obj.value
    }
    fetch('/landlord-discard',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(sending)
    }).then(d=>{
        console.log("Cancle req recieved")
    }).catch(e=>{
        console.log("Error discard")
    })
}




async function loadlast() {
    var load=document.getElementById('prevload');
    console.log(load.checked)
    if(load.checked)
    {
        var returned=await fetch("/loadlast")
        returned.json()
            .then(d=>{
                if(d.load)
                {
                    var inp=document.getElementById("reading").getElementsByTagName("input")
                    // console.log("Filling inputs: "+inp.length)
                    var i=0;
                    d.load.forEach(e=>{
                        // console.log("i: "+i)
                        // console.log(e.finalUnit)
                        inp[i].value=e.finalUnit;
                        i=i+2;
                    })
                }
                else {
                    console.log("No data found")
                }
            })
    }
    else {
        document.getElementById("reading").reset();
    }
}



async function checkLandlord() {
    var lid=document.getElementById('landlordinp').value;
    if(!lid) {
        document.getElementById("exist").style.display="none";
        document.getElementById("notexist").style.display="none";
        return;
    }
    var returned=await fetch("/landlordcheck?lid="+lid)
    returned.json()
        .then(d=>{
            if(d.exist)
            {
                document.getElementById("exist").style.display="inline";
                document.getElementById("notexist").style.display="none";
            }
            else {
                document.getElementById("notexist").style.display="inline";
                document.getElementById("exist").style.display="none";
            }
        })
}
