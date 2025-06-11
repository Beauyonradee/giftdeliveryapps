// Server base domain url 
const domainUrl = "http://localhost:3000";  // if local test, please use this 

//==================================index.html==================================//

var debug = true;
var authenticated = false;


$(document).ready(function () {
	
/**
	----------------------Event handler to process login request----------------------
**/
   
	$('#loginButton').click(function () {

		localStorage.removeItem("inputData");

		$("#loginForm").submit();

		if (localStorage.inputData != null) {

			var inputData = JSON.parse(localStorage.getItem("inputData"));

			$.post(domainUrl + "/verifyUserCredential", inputData,  function(data, status) {

				if (debug) alert("Data received: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
				
				if (Object.keys(data).length > 0) {
					alert("Login success");
					authenticated = true;
					localStorage.setItem("userInfo", JSON.stringify(data));	
					$("body").pagecontainer("change", "#homePage");
				} 
				else {
					alert("Login failed");
				}

				$("#loginForm").trigger('reset');	
			})
		}
		
	})


	$("#loginForm").validate({ // jQuery validation plugin
		focusInvalid: false,  
		onkeyup: false,
		submitHandler: function (form) {   
				
			var formData =$(form).serializeArray();
			var inputData = {};
			formData.forEach(function(data){
				inputData[data.name] = data.value;
			})

			localStorage.setItem("inputData", JSON.stringify(inputData));		

		},
		/* Validation rules */
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				rangelength: [3, 10]
			}
		},
		/* Validation message */
		messages: {
			email: {
				required: "Please enter your email",
				email: "The email format is incorrect  "
			},
			password: {
				required: "The password cannot be empty",
				rangelength: $.validator.format("Minimum Password Length:{0}, Maximum Password Length:{1}。")

			}
		},
	});
	/**
	--------------------------end--------------------------
	**/	
	
	/**
	------------Event handler to respond to selection of gift category-------------------
	**/

	$('#itemList li').click(function () {
		
		var itemName = $(this).find('#itemName').html();
		var itemPrice = $(this).find('#itemPrice').html();
		var itemImage = $(this).find('#itemImage').attr('src');

		localStorage.setItem("itemName", itemName);
		localStorage.setItem("itemPrice", itemPrice);
		localStorage.setItem("itemImage", itemImage);
	}) 

	/**
	--------------------------end--------------------------
	**/	
	
	/**
	--------------------Event handler to process order submission----------------------
	**/

	$('#confirmOrderButton').click(function () {
		
		localStorage.removeItem("inputData");

		$("#orderForm").submit();

		if (localStorage.inputData != null) {
		
			var orderInfo = JSON.parse(localStorage.getItem("inputData"));

			orderInfo.itemName = localStorage.getItem("itemName");
			orderInfo.itemPrice = localStorage.getItem("itemPrice");
			orderInfo.itemImage = localStorage.getItem("itemImage");
			
			var userInfo = JSON.parse(localStorage.getItem("userInfo"));
			orderInfo.customerEmail = userInfo.email;

			orderInfo.orderNo = Math.trunc(Math.random()*900000 + 100000);

			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
			if (debug) alert(JSON.stringify(orderInfo));

			$.post(domainUrl + "/insertOrderData", orderInfo, function(data, status) {
				if (debug) alert("Data sent: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
			
				//clear form data 
				$("#orderForm").trigger('reset');
				$("body").pagecontainer("change" , "#orderConfirmationPage");
	
			});		
		}

	})


	$("#orderForm").validate({  // jQuery validation plugin
		focusInvalid: false, 
		onkeyup: false,
		submitHandler: function (form) {   
			
			var formData =$(form).serializeArray();
			var inputData = {};

			formData.forEach(function(data){
				inputData[data.name] = data.value;
			});
			
			if (debug) alert(JSON.stringify(inputData));

			localStorage.setItem("inputData", JSON.stringify(inputData));
					
		},
		
		/* validation rules */
		
		rules: {
			firstName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			lastName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			phoneNumber: {
				required: true,
				mobiletxt: true
			},
			address: {
				required: true,
				rangelength: [1, 25]
			},
			postcode: {
				required: true,
				posttxt: true
			},/*
			oDate: {
				required: true,
				datetime: true
			},*/
		},
		/* Validation Message */

		messages: {
			firstName: {
				required: "Please enter your firstname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),

			},
			lastName: {
				required: "Please enter your lastname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			phoneNumber: {
				required: "Phone number required",
			},
			address: {
				required: "Delivery address required",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			postcode: {
				required: "Postcode required",

			}		
		}
	});

	/**
	--------------------------end--------------------------
	**/


	/**
	--------------------Event handler to perform initialisation before the Login page is displayed--------------------
	**/

	$(document).on("pagebeforeshow", "#loginPage", function() {
	
		localStorage.removeItem("userInfo");
		
		authenticated = false;
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	

	/**
	--------------------Event handler to populate the Fill Order page before it is displayed---------------------
	**/

	
	$(document).on("pagecreate", "#fillOrderPage", function() {
		
		$("#itemSelected").html(localStorage.getItem("itemName"));
		$("#priceSelected").html(localStorage.getItem("itemPrice"));
		$("#imageSelected").attr('src', localStorage.getItem("itemImage"));
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	

	/**
	--------------------Event handler to populate the Order Confirmation page before it is displayed---------------------
	**/
	 
	$(document).on("pagebeforeshow", "#orderConfirmationPage", function() {
		
		$('#orderInfo').html("");

		if (localStorage.orderInfo != null) {
	
			var orderInfo = JSON.parse(localStorage.getItem("orderInfo"));
	
			$('#orderInfo').append(`<br><table><tbody>`);
			$('#orderInfo').append(`<tr><td>Order no: </td><td><span class=\"fcolor\"> ${orderInfo.orderNo} </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Customer: </td><td><span class=\"fcolor\"> ${orderInfo.customerEmail} </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Item: </td><td><span class=\"fcolor\"> ${orderInfo.itemName}  </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Price: </td><td><span class=\"fcolor\"> ${orderInfo.itemPrice} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Recipient: </td><td><span class=\"fcolor\"> ${orderInfo.firstName} ${orderInfo.lastName}</span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Phone: </td><td><span class=\"fcolor\"> ${orderInfo.phoneNumber} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Address: </td><td><span class=\"fcolor\"> ${orderInfo.address} ${orderInfo.postcode} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Dispatch date: </td><td><span class=\"fcolor\"> ${orderInfo.date} </span></td></tr>`);
			$('#orderInfo').append(`</tbody></table><br>`);
		}
		else {
			$('#orderInfo').append('<h3>There is no order to display<h3>');
		}
	});  

	/**
	--------------------------end--------------------------
	**/	


	/**
	--------------------Event handler for Sign Up page---------------------
	**/

	$(document).on('click', '#submitButton', function () {
		$("body").pagecontainer("change", "#signupPage");

		const form = {
			email: $('#Email').val(),
			password: $('#Password').val(),
			firstName: $('#FirstName').val(),
			lastName: $('#LastName').val(),
			state: $('#State').val(),
			phoneNumber: $('#PhoneNumber').val(),
			address: $('#Address').val(),
			postcode: $('#Postcode').val()
		};

		// Validate required
		if (!form.email || !form.password || !form.firstName || !form.lastName || !form.state ||
			!form.phoneNumber || !form.address || !form.postcode) {
			alert("Please fill all details.");
			return;
		}

		// Check for duplicate email
		$.get(`${domainUrl}/checkEmailExists?email=${form.email}`, function (data) {
			if (data.exists) {
				alert("This email has been registered. Please use a different email.");
			} else {
				// Proceed to register
				$.ajax({
					url: `${domainUrl}/registerNewUser`,
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(form),
					success: function (res) {
						alert('Sign-up successful!');
						localStorage.setItem("userInfo", JSON.stringify(form));
						$('#signupForm').trigger('reset');
						$("body").pagecontainer("change", "#homePage");
					},
					error: function (err) {
						alert('Sign-up failed. Please try again.');
						console.error(err);
					}
				});
			}
		});
	});

	/**
	--------------------------end--------------------------
	**/

	/**
	--------------------Event handler for Order List page---------------------
	**/
	$(document).on("pagebeforeshow", "#pastOrdersPage", function () {
		
		$('#pastOrdersList').html(""); // Clear previous list

		const userInfo = JSON.parse(localStorage.getItem("userInfo"));

		if (!userInfo || !userInfo.email) {
			$('#pastOrdersList').append('<li><h3>User not logged in.</h3></li>');
        	return;
		}

		// Clear previous order
		$("#pastOrdersList").empty();

		$.get(`${domainUrl}/getUserOrders`, { email: userInfo.email }, function (orders) {
			if (orders.length === 0) {
				$("#pastOrdersList").append(`<li><h3>No past orders found.</h3></li>`);
			} else {
				orders.forEach(function (orderInfo) {
					$('#pastOrdersList').append(`<br><table><tbody>`);
					$('#pastOrdersList').append(`<tr><td>Order no:</td><td><span class="fcolor">${orderInfo.orderNo}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Customer:</td><td><span class="fcolor">${orderInfo.customerEmail}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Item:</td><td><span class="fcolor">${orderInfo.itemName}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Price:</td><td><span class="fcolor">${orderInfo.itemPrice}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Recipient:</td><td><span class="fcolor">${orderInfo.firstName} ${orderInfo.lastName}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Phone:</td><td><span class="fcolor">${orderInfo.phoneNumber}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Address:</td><td><span class="fcolor">${orderInfo.address} ${orderInfo.postcode}</span></td></tr>`);
					$('#pastOrdersList').append(`<tr><td>Dispatch date:</td><td><span class="fcolor">${orderInfo.date}</span></td></tr>`);
					$('#pastOrdersList').append(`</tbody></table><br>`);
				});
			}
		}).fail(function () {
			$('#pastOrdersList').append('<li><h3>Error loading orders</h3></li>');
		});
	});

	/**
	--------------------------end--------------------------
	**/


		/**
	--------------------Event handler for delete confirmation page---------------------
	**/
	$(document).on("click", "#deleteLink", function(e) {
		e.preventDefault(); // stop the link from navigating immediately
		
		//Get current userID
		const userInfo = JSON.parse(localStorage.getItem("userInfo"));

		// Check if user is logged in or only current user can delete orders
		if (!userInfo || !userInfo.email) {
			alert("Please log in to delete orders.");
			return;
		}
	
		// Confirmation message
		if (!confirm("Do you want to delete all your past orders?")) {
			return;
		}
		
		//Send Delete request to server
		$.ajax({
			url: `${domainUrl}/deleteOrders?email=${userInfo.email}`,
			type: "DELETE",
			success: function (res) {
				const deletedCount = res.deletedCount;
				$("#deleteContent p").html(`<strong>${deletedCount} orders deleted.</strong>`);
				$("body").pagecontainer("change", "#deleteConfirmation");
			},
			error: function (err) {
				alert("Failed to delete orders.");
			}
		});
	});

	/**
	--------------------------end--------------------------
	**/	


});



