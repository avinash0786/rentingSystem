console.log("Script for tenant login , landlord exist check")

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
