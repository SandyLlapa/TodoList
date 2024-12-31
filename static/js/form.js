
// var map;

// function initMap() {
//   var myLatLng = {lat: 44.977276, lng: -93.232266};
//   map = new google.maps.Map(document.getElementById('map'), {zoom: 14, center: myLatLng});
//   addAutoComplete();
// }


// function addAutoComplete(){
//   const input = document.getElementById('location');

//   if (google.maps.places) {
//     const autocomplete = new google.maps.places.Autocomplete(input);

//     map.addListener("click",function(mapsMouseEvent){
//       const latLng = mapsMouseEvent.latLng;
//       const geocoder = new google.maps.Geocoder();

//       geocoder.geocode({location:latLng},(results,status)=>{
//         if(status==="OK"){
//           if(results[0]){
//             input.value=results[0].formatted_address;
//           }
//         }
//         else{
//           alert("Failed due to " + status);

//         }
//       });
//     });
//   }
//   else{
//     alert("Failed Autocomplete");
//   }
// }