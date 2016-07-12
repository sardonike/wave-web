var auth = {
    getToken: function() {
        return localStorage.getItem('access_token');

    },
getXToken:function(){
  return localStorage.getItem('x_token');
},
    setToken: function(access_token) {
        localStorage.setItem('access_token',access_token);

    },
setXToken: function(access_token){
  localStorage.setItem('x_token',access_token);
},
    isAuthenticated: function() {
        return this.getToken()!=null;
    },
    requestToken: function() {
        return "Random String";
    }
};

function trueRequestFunction() {
       $.ajax({
           url: "http://128.199.232.120/oauth/token",
           method: "POST",
           data: {
               "client_id": "2d01f866507b7e8755be57d11da36d8493dcba57245c09321078d7b4d6d74198",
               "client_secret": "eb59bdac73d3eec58706f9f2808666a69f8ff5a0c61fc541593236e80a7c1020",
               "grant_type": "client_credentials"},
    success: function(data){
      //console.log("Success");
      //console.log(data);
      //var json_obj = $.parseJSON(data);
      auth.setToken(data.access_token);
       },
    error: function(){
      console.log("Nope");
    }

       });


   }

   $.ajaxSetup({
         headers: {
             Authorization:"Bearer "+ auth.getToken(),
 			"X-Authorization": auth.getXToken()
         },
         beforeSend: function(jqXHR, request) {
             if (request.url.indexOf("oauth/token") > -1 ){
                 return true;
             }
             return auth.isAuthenticated();
         }
     });

     function getPoints(){
   		$.ajax({
   			url: "http://128.199.232.120/points",
   			method: "GET",
   			success: function(data){
   				console.log("Success");
   				//console.log(JSON.stringify(data))
           myPoints = JSON.parse(JSON.stringify(data));
           //console.log(myPoints);
           //console.log(JSON.stringify(myPoints[0].name))
   			},
   			error: function(data){
   				console.log("error");
   				console.log(JSON.stringify(data));
   			},
         async: false

   		});
   	}

    function getRoutes(){
      $.ajax({
  			url: "http://128.199.232.120/routes",
  			method: "GET",
  			success: function(data){
  				console.log("Success");
  				//console.log(JSON.stringify(data))
          myRoutes = JSON.parse(JSON.stringify(data));
          //console.log(myPoints);
          //console.log(JSON.stringify(myPoints[0].name))
  			},
  			error: function(data){
  				console.log("error");
  				console.log(JSON.stringify(data));
  			},
        async: false

  		});
    };

    function selectFunction(){
      $(".routeSelected").removeClass("routeSelected");
      $('#'+(this.id)).addClass('routeSelected');
      //console.log(this.id);
      //var bookedData = $('#'+(this.id)).data();
      id = $('#'+(this.id)).data('id');
      cost =$('#'+(this.id)).data('cost');
      oco = $('#'+(this.id)).data('ocoo');
      dco = $('#'+(this.id)).data('dcoo');
      mapFunction();
    }



    function mapFunction(){
    maplat[0]=oco;
    maplat[1]=dco;
    initialize();

    }

    function bookingFunction(pP,sched){
      $.ajax({
        url: "http://128.199.232.120/bookings",
        method: "POST",
        data:{
          "booking":{
            "route_id":pP,
            "schedule":sched
          }
        },
        success: function(data){
          window.setTimeout(function() {
            window.location.href = "afterbooking2.html";
          });
        },
        error: function(data){
          console.log("error");
          console.log(JSON.stringify(data));
        }
      });
    }

    function initialize() {
      var mapProp = {
        center:new google.maps.LatLng(maplat[0].split(',')[0],maplat[0].split(',')[1]),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

      for (var i = 0; i < 2; i++) {
        var marker=new google.maps.Marker({
          position:new google.maps.LatLng(maplat[i].split(',')[0],maplat[i].split(',')[1]),
          map:map
        });
      }

    }

    $(function(){
        var dtToday = new Date();

        var month = dtToday.getMonth() + 1;
        var day = dtToday.getDate() +7;
        var year = dtToday.getFullYear();
        if(month < 10)
            month = '0' + month.toString();
        if(day < 10)
            day = '0' + day.toString();

        var maxDate = year + '-' + month + '-' + day;
        $('#date').attr('max', maxDate);
    });


$(document).ready(function () {
  myPoints=[];
  myRoutes=[];
  id ='';
  cost='';
  oco='';
  dco='';
  maplat=["12.8797,121.7740"];
  var map;
	trueRequestFunction();
	getPoints();
  getRoutes();
  google.maps.event.addDomListener(window, 'load', initialize);


    for(var i in myPoints){
      //$('<option/>').val(myPoints[i].ID).text(myPoints[i].name).appendTo('#pPoints');
      document.getElementById("pPoints").innerHTML += '<option value='+myPoints[i].id+'>'+myPoints[i].name+'</option>'

    }

  $("#pPoints").on('change', function() {
    document.getElementById("routes").innerHTML = ''
    document.getElementById("routes").innerHTML += '<li class="c">\
    <div class="row">\
      <div class="col-sm-4">Origin</div>\
      <div class="col-sm-4">Destination</div>\
      <div class="col-sm-4">Cost</div>\
    </div></li>'

    for(var i in myRoutes){
      if ($('#pPoints').val() == myRoutes[i].origin_id){

          if(i%2==0){
            document.getElementById("routes").innerHTML += '<li class="routeSelect a" id="routeLink'+i+'" \
            data-id="'+myRoutes[i].id+'"\
            data-cost="'+myRoutes[i].price+'" data-ocoo="'+myPoints[(myRoutes[i].origin_id)-1].coordinates+'" \
            data-dcoo="'+myPoints[(myRoutes[i].destination_id)-1].coordinates+'">\
            <div class="row">\
              <div class="col-sm-4">'+myPoints[(myRoutes[i].origin_id)-1].name+'</div>\
              <div class="col-sm-4">'+myPoints[(myRoutes[i].destination_id)-1].name+'</div>\
              <div class="col-sm-4">'+myRoutes[i].price+'</div>\
            </div></li>'

          }
          else{
            document.getElementById("routes").innerHTML += '<li class="b routeSelect" id="routeLink'+i+'" \
            data-id="'+myRoutes[i].id+'"\
            data-cost="'+myRoutes[i].price+'" data-ocoo="'+myPoints[(myRoutes[i].origin_id)-1].coordinates+'" \
            data-dcoo="'+myPoints[(myRoutes[i].destination_id)-1].coordinates+'">\
            <div class="row">\
              <div class="col-sm-4">'+myPoints[(myRoutes[i].origin_id)-1].name+'</div>\
              <div class="col-sm-4">'+myPoints[(myRoutes[i].destination_id)-1].name+'</div>\
              <div class="col-sm-4">'+myRoutes[i].price+'</div>\
            </div></li>'
          }

      }

    }


    routes = document.getElementsByClassName('routeSelect');
      for (var i = 0; i < routes.length; i++) {
        routes[i].addEventListener('click',selectFunction,false);
      }


    $('#routes').fadeIn(1000);
});

$('#submitting').click(function(){
  pP = id;
  d = $('#date').val() + "T";
  t = $('#t1').val();
  t2 =":"+ $('#t2').val();
  time = t.concat(t2);
  sched = d.concat(time);
  bookingFunction(pP,sched);
});



});
