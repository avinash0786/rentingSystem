console.log("Script for tenant login , landlord exist check")


async function checkLandlord() {
    var lid=document.getElementById('landlordinp').value;
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
