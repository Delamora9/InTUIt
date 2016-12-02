
//------------AJAX CALLS----------//
//Sign up --DRAFT
$("#loginQuery").click(function(){
	$.ajax({
		type: "PUT",
		url: "http://146.7.44.180:8080/signIn",
		data: {"userID": "user", "mode": "Sup"},
		success: function(data, textStatus, xhr){
			if (xhr.status == 200) {
				if(xhr.responseText == "User signed in.") { 
				console.log("Logged in!");
				//networkSelect();
				}
			}
			//else: "error message";
			response = xhr.responseText;
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
		console.log(errorThrown);
		//or does the error message go here?
		}
	});
});

//Sign IN --DRAFT
$("#loginQuery").click(function(){
	$.ajax({
		type: "PUT",
		url: "http://146.7.44.180:8080/signIn",
		data: {"userID": "user", "mode": "Sin"},
		success: function(data, textStatus, xhr){
			if (xhr.status == 200) {
				if(xhr.responseText == "User signed in.") { 
				console.log("Logged in!");
				//networkSelect();
				}
			}
			//else: "error message";
			response = xhr.responseText;
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
		console.log(errorThrown);
		//or does the error message go here?
		}
	});
});

//Retrieve available network(s) --DRAFT
$("#networkQuery").click(function() {
	$.ajax({
		type: "GET",
		url: "http://146.7.44.180:8080/signIn",
		data: {"netID": networkName},
		success: function(data, textStatus, xhr){
			if (xhr.status == 200) {
				//confirm, move to login page
				console.log("Network works!");
			}
			//else
			response = xhr.responseText;
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
		}
	});
});


//Network stuff --DETAILS, DRAFT
"GET", ONCE LOGGED IN, url: "...8080/users"
returns in associative array, key = provisionnetworks, actual list of networks = value;
SUP LIN LOUT

//WORKING AJAX --SIGN IN
$	$.ajax({
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": "Team05", "mode": "Lin"}),
		method: 'PUT',
		data: {userPass: 'csc450'},
		success: function(data, status, xhttp){
			alert(data);
		},
		error: function(data, status, xhttp)
		{
			alert(data);
		}
	});
	
//VIEW USER PROFILE --WORKS
	$.ajax({
		url: 'http://146.7.44.180:8080/users',
		method: 'GET',
		success: function(data, xhttp) {
			alert(data);
		},
		error: function(data, xhttp)
		{
			alert(data);
		}
	});