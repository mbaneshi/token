

//public xrpl websocket url
const PUBLIC_SERVER = "wss://xrplcluster.com/"

  

//all codes goes here 
    
  $(document).ready(function(){

   //document get ready , so it is ready to run code 
   console.log('I am Document , I am ready');
   $('#form').css('visibility','visible');
   
   //focus first elemet to start
   $("issuer_address").focus();



  $("#issuer_address").on('blur',function () { 
  
    $('#isuuer_address_error').text(''); 
    $('#isuuer_address_info').text(''); 
    
    var issuer_address = $(this).val();
    
    var account_info = get_account_info_fn(issuer_address);
    console.log('acount_info',account_info)
    
    acount_line_info = get_acount_line_info_fn(issuer_address)
    
    account_info.then(
      (e) => {
        
        console.log('this is acount info in resolved promise',e);
        $('#isuuer_address_error').text('') 
        $('#isuuer_address_info').text('Account Balance '+e.result.account_data.Balance / 1000000);
      }
      ).catch(e => {
        console.log(e)
        $('#isuuer_address_info').text(''); 
        $('#isuuer_address_error').text(e.data.error_message) 
      }
      );

      //handle return promise for line 
      //account_line_info = await get_acount_line_info_fn(issuer_address)
      account_line_info.then(e=>console.log('this is acount line info in resolved promise ', e.result.lines))
      
      .catch(err =>console.log(err))
      
      
    });
  
    //reciever adress code flow 
 $('#reciever_address').on('blur', function () {
    

    /*
    currency_can_recieve = currency_can_recieve_fn(reciever_address);
    currency_can_recieve.then(data => {
      var currency_can_recieve_arr = data.result.receive_currencies;
      var currencies_can_send_arr = data.result.send_currencies;
               console.log('currencies this acount can recieve ',currency_can_recieve_arr);
               console.log('currencies this acount can recieve ',currencies_can_send_arr);
      var curreny_name = $('#currency_name').val();

//check for existance 



if(currency_can_recieve_arr.includes(curreny_name))
{
 	// Do something
   $('#currencies_can_recieve').html('this acount can recieve '+curreny_name)
   
   
  }
  else{
    
    $('#currencies_can_recieve').html('this acount can NOT recieve '+curreny_name)
}




    }
    )
      .catch(e => console.log(e));
      

*///end of currency_can_recieve_fn





  });

  //handle form submission
$('#form').on('submit', function (e) {

  e.preventDefault();
  
   var issuer_address = e.target.issuer_address.value
   var currency_name =  e.target.currency_name.value
   var sender_address =  e.target.sender_address.value
   var sender_seed =  e.target.sender_seed.value
   var reciever_address_comma_seprated =  e.target.reciever_address.value
   var token_quantity =  e.target.token_quantity.value
   reciever_address_array = reciever_address_comma_seprated.split(',');

   var length =  reciever_address_array.length
for (i=0; i<length;i++){

  console.log(`transaction prepare for address ${reciever_address_array[i]}`);


   response_from_transaction  = send_token_fn(sender_address = sender_address,
    reciever_address = reciever_address_array[i],
    issuer_address = issuer_address,
    token_quantity = token_quantity,
    sender_seed = sender_seed,
    currency_name = currency_name);


    response_from_transaction.then(e=>{console.log(e)})

    .catch(e =>{console.log(e)});


}


 
})

});//End Of document ready

//Async function Definition 
//--------------------------------------------------------

//function to get currency that adress can recieved 
async function currency_can_recieve_fn(address) {
  var client = new xrpl.Client(PUBLIC_SERVER)
  await client.connect()
  
  currency_can_recieve_command = {
      "command": "account_currencies",
      "account": address,
      "strict": true,
      "ledger_index": "validated"
  }
 var currency_can_recieve = await client.request(currency_can_recieve_command);
  client.disconnect();
  return currency_can_recieve

}

// function to Send token  
async function send_token_fn(
  sender_address,
  reciever_address,
  issuer_address,
  token_quantity,
  sender_seed,
  currency_name) {
  
  const client = new xrpl.Client(PUBLIC_SERVER)
  await client.connect()
  //log some submites information to console 
  console.log(`Sender address is ${sender_address}`);
  console.log(` Reciever address is ${reciever_address}`);
  console.log(`Issue  address is ${issuer_address}`);
  console.log(`Token Quantity is ${token_quantity}`);
  console.log(`Sender  Seed is ${sender_seed}`);
  console.log(` Currency name  is ${currency_name}}`);
 //prepare parameter for transaction

  const sender_wallet = xrpl.Wallet.fromSeed(sender_seed) 

  const send_token_tx = {
    "TransactionType": "Payment",
    "Account":sender_address
    ,
    "Amount": {
      "currency": currency_name,
      "value": token_quantity,
      "issuer":issuer_address
    },
    "Destination": reciever_address,
    
  }

  const pay_prepared = await client.autofill(send_token_tx)
  const pay_signed = sender_wallet.sign(pay_prepared)

  console.log(`Sending ${token_quantity} ${currency_name} to ${reciever_address}...`)
  const pay_result = await client.submitAndWait(pay_signed.tx_blob)
  
  console.log('pay result of transaction is as follows ', pay_result);
 /*
  console.log('pay result type  ', pay_result.type);
  console.log('pay result Account is as follows ', pay_result.Account);
  console.log('pay result Amount is as follows ', pay_result.Amount);
  console.log('pay result  currency is as follows ', pay_result.Amount.currency);
  console.log('pay result issuer is as follows ', pay_result.Amount.issuer);
  console.log('pay result  value is as follows ', pay_result.Amount.value);
*/
  
     
  client.disconnect()
} 

//function to get acount information 
async function get_account_info_fn (address) {
var client = new xrpl.Client(PUBLIC_SERVER)
   await client.connect()
      const account_info = await client.request({
     "command": "account_info",
     "account": address,
     "ledger_index": "validated"
   })
   //console.log(`account info for ${address} is ` ,account_info)
// issuer_address_info_el.innerText(account_info.type)
   //acount_balance_el.innerText  =String(account_info.result.account_data.Balance)
   //console.log('account_info.id',account_info.id)
  //  console.log('account_info.result.account_data',account_info.result.account_data)
  //  console.log('account_info.result.account_data.Balance',account_info.result.account_data.Balance)
  //  console.log('account_info.type',account_info.type)
  // Do something asynchronous
  //return account_info.result.account_data.Balance;
  client.disconnect()
  return account_info;
} 

 //function to get acount TRUST LINE  information 
async function get_acount_line_info_fn(address){
    var client = new xrpl.Client(PUBLIC_SERVER)
    await client.connect()

  
    const account_line_info = await client.request({
      "id": 1,
      "command": "account_lines",
      "account": address
    })
     //console.log(`account Line Information for ${address} is `, account_line_info)
     
     var line_data = account_line_info.result.lines;
     console.log('line data length is ', line_data.length)

     for (let i = 0; i < line_data.length; i++){
    console.log(`line#$#${i}`,line_data[i]) ;
    if(line_data[i].currency ==$('#currency_name').val()&& -line_data.balance>=100){
                console.log('',line_data[i].acount);
                console.log('',line_data[i].acount);
    }

    }
    return account_line_info;

    //    var currency_name = $('#currency_name').val();
       
    //    if(currency_name ==line_data[i].currency){

    //     var trusline_status= true
    //   }
       
    //   //  if(trusline_status){
    //     //    $(#trustline_info).text('Reciever has trusline set , it is ready to go')
    //     //  }else {
    //       //   $(#trustline_error).text('Reciever has not trusline set , please make it set ')
          
    client.disconnect()
          
        }
        
        //console.log('line data ',line_data)
        
        
      
  
//function to get account balance 
async function get_account_balabce_info_fn(address) {
    
  console.log(`Getting  balances transaction for ${address}`);
  var client = new xrpl.Client(PUBLIC_SERVER)
    await client.connect()
 
  
  const address_balance  = await client.request({
    command: "account_lines",
    account: address,
    ledger_index: "validated"
  })

  console.log(`Balance for ${address} is  `,address_balance)
 client.disconnect() 

}

//function to get account line information
async function get_acount_line_info(address) {
var client = new xrpl.Client(PUBLIC_SERVER)
    await client.connect() 
  
  
  var account_line_info_command_object= {
  "id": 1,
  "command": "account_lines",
  "account": address
  }
  account_line_info = await client.request(account_line_info_command_object);
  client.disconnect();
  return account_line_info
}

//function to get gateway balance 
async function get_gateway_balance_fn(address) {
 var client = new xrpl.Client(PUBLIC_SERVER)
    await client.connect()  

  var gateway_balance_command = {
      "id": "example_gateway_balances_1",
      "command": "gateway_balances",
      "account": address,
      "strict": true,
      "ledger_index": "validated"
  }
  account_gateway_balance_info = await client.request(gateway_balance_command);
  client.disconnect();
  return account_gateway_balance_info

}

