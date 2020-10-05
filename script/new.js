console.log("Script for tenant login , landlord exist check")
async function getTransInfo(tid,obj){
    let name=obj.parentNode.parentNode.firstElementChild.nextElementSibling.innerHTML;
    console.log("Get transaction info requested tid: "+tid)
    console.log("Function called for tid: "+tid)
    var returned=await fetch("/transinfo?tid="+tid)
    let tempoDate;
    returned.json()
        .then(d=>{
            if(d.data.paidON==null){
                tempoDate="Not Paid"
            }else {
                tempoDate=d.data.paidON.slice(0,10);
            }
            console.log(d)
            document.getElementById("Tid").textContent="Transaction ID: "+d.data.tid;
            document.getElementById("Tname").textContent="Name: "+name;
            document.getElementById("Tyr").textContent="Year: "+d.data.year;
            document.getElementById("Tmnt").textContent="Month: "+d.data.month;
            document.getElementById("Tpd").textContent="Paid on: "+tempoDate;
            document.getElementById("Tbr").textContent="Base Rent: Rs "+d.data.baseRent;
            document.getElementById("Tcr").textContent="Created on: "+(d.data.dateGenerated).slice(0,-14);
            document.getElementById("Twt").textContent="Water:Rs "+d.data.water;
            document.getElementById("Tel").textContent="Electricity:Rs "+d.data.electricity;
            document.getElementById("Tmn").textContent="Maintenance:Rs "+d.data.maintenance;
            document.getElementById("Tini").textContent="Initial Unit: "+d.data.initialUnit;
            document.getElementById("Tfin").textContent="Final Unit: "+d.data.finalUnit;
            document.getElementById("Tene").textContent="Tenant ID: "+d.data.tenantID;
            document.getElementById("Tsec").textContent="Security: "+d.data.security;
            document.getElementById("Tamt").textContent="Total Amount:Rs "+d.data.amount;

        })
}
//document.ready.function
async function updateDropRec(month){
    console.log("Recieved Drop Req")
    console.log("Month: "+month)
    var returned=await fetch("/landlord-transDropdown?month="+(month+1)+"&select=true")
    returned.json()
        .then(d=>{
            console.log(d)
            let slect=$("#recievedTable > tbody")
            console.log(d.total)
            $("#recCount").text(d.total+" %")
            $("#recBar").css("width",d.total+"%")
            $("#recBar").attr("aria-valuenow",d.total)
            if(d.load.length>0)
            {
                $("#infoRecMonth").text("Showing Recieved transactions of month: "+d.monName)
                slect.empty();
                console.log("Success")
                d.load.forEach(dis=>{
                    // console.log(`tid: ${dis.tid} Name: ${dis.NameMatch[0].fname}  amount:  ${dis.amount}`);
                    slect.append(`
                <tr style="height: 12px;font-size: 16px;"><td style="padding: 0px;height: 12px;width: 24%;">TID ${dis.tid} </td>
                <td style="padding: 0px;height: 12px;width: 40%;">${dis.NameMatch[0].fname}</td>
                <td style="padding: 0px;height: 12px;">
                <i class="fa fa-rupee" style="color: rgb(25,119,187);border-color: rgb(13,67,171);margin-left: 0px;">
                </i> ${dis.amount} <i class="fa fa-check-square-o float-right" data-target="#transmodel" data-toggle="modal" onclick='getTransInfo(${dis.tid},this)' style="color: rgb(43,116,31);margin-top: 5px; cursor: pointer;""></i>
                </td></tr>`)
                })
            }
            else {
                    slect.empty();
                    $("#infoRecMonth").text("Showing Recieved transactions of month: "+d.monName)
                    $("#recCount").text("0 %")
                    slect.append(`<tr style="height: 12px;font-size: 16px;">
                                <td colspan="3" align="center">No recieved Transactions</td>
                            </tr>`)
            }
        }).catch(e=>{
        console.log("Error")
        console.log(e)
    })
}
async function updateDropPen(month){
    console.log("Pending Drop Req")
    console.log("Month: "+month)
    // /landlord-transDropdown
    var returned=await fetch("/landlord-transDropdown?month="+(month+1)+"&select=false")
    returned.json()
        .then(d=>{
            console.log(d)
            let slect=$("#pendingTable > tbody")
            console.log(d.total)
            $("#penCount").text(d.total+"%")
            $("#pendBar").css("width",d.total+"%")
            $("#pendBar").attr("aria-valuenow",d.total)
            if(d.load.length>0)
            {
                $("#infoPenMonth").text("Showing Pending transactions of month: "+d.monName)
                slect.empty();
                console.log("Success")
                console.log("Success")
                d.load.forEach(dis=>{
                    // console.log(`tid: ${dis.tid} Name: ${dis.NameMatch[0].fname}  amount:  ${dis.amount}`);
                    slect.append(`
                <tr style="height: 12px;font-size: 16px;"><td style="padding: 0px;height: 12px;width: 24%;">TID ${dis.tid }</td>
                <td style="padding: 0px;height: 12px;width: 40%;">${dis.NameMatch[0].fname}</td>
                <td style="padding: 0px;height: 12px;">
                <i class="fa fa-rupee" style="color: rgb(25,119,187);border-color: rgb(13,67,171);margin-left: 0px;">
                </i> ${dis.amount} <i class="fa fa-question-circle float-right" data-target="#transmodel" data-toggle="modal" onclick='getTransInfo(${dis.tid},this)' style="color: rgb(208,37,37);padding-top: 2px;margin-top: 2px; cursor: pointer;"></i>
                </td></tr>`)
                })

            }
            else {
                    slect.empty();
                    $("#penCount").text("0 %")
                    $("#infoPenMonth").text("Showing Pending transactions of month: "+d.monName)
                slect.append(`<tr style="height: 12px;font-size: 16px;">
                                <td colspan="3" align="center">No recieved Transactions</td>
                            </tr>`)
            }
        }).catch(e=>{
        console.log("Error")
        console.log(e)
    })
}

$(function () {
    $('#autotenant').autocomplete({
        source:function (req,res) {
            $.ajax({
                url:'/tenantGet',
                dataType:'jsonp',
                type:"GET",
                data:req,
                success:function (data) {
                    res(data)
                },
                error:function (err) {
                    console.log("Error Tenant Fetch!")
                }
            });
        },
        minLength:1,
        focus:function (event,ui) {
            if(ui.items){
                $("#autotenant").text(ui.items.label)
            }
        },
        select:function (event,ui) {
            if(ui.items){
                $("#autotenant").text(ui.items.label)
                $("#autotenant").val(ui.items.label)
            }
        },
    });

})

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
