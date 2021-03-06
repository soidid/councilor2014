
var app = angular.module("app", [
  "ngRoute",
  "firebase"
]);

//http://stackoverflow.com/questions/16310298/if-a-ngsrc-path-resolves-to-a-404-is-there-a-way-to-fallback-to-a-default
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);  
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
});

app.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider){
    $routeProvider.
      when('/report',{
      templateUrl: 'partials/report.html',
      controller: 'ReportCtrl'
    }).
      otherwise({
      redirectTo:'/',
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    });

    $locationProvider.html5Mode(false);

  }
]);

app.factory('DataService', function ($firebase){
  
  var DataService = {};
  var ref = new Firebase("https://councilor.firebaseio.com/");
  
  DataService.candidates = function (){

    var sync = $firebase(ref.child("candidates/"));
    //return sync.$asObject();
    return sync.$asArray();
    
  };

  DataService.getCandidatesObj = function (){

    var sync = $firebase(ref.child("candidates/"));
    return sync.$asObject();
  
  };
  DataService.getDistricts = function (){

    var sync = $firebase(ref.child("districts/"));
    return sync.$asArray();
    
  };
  DataService.getDistrictsObj = function (){

    var sync = $firebase(ref.child("districts/"));
    return sync.$asObject();
    
  };

  DataService.getReports = function (){

    var sync = $firebase(ref.child("reports/"));
    return sync.$asArray();
    
  };

  DataService.pushReports = function ($item){

    var sync = $firebase(ref.child("reports/"));
    sync.$push($item).then(function(newChildRef) {
        console.log("added record with id " + newChildRef.name());
    });
    
  };

  return DataService;

  

})

app.controller('NavCtrl', ['$scope', '$location', function ($scope, $location){
   $scope.go = function(path){
      $location.path(path);
   };

}]);
app.controller('IndexCtrl', ['$scope', 'DataService', function ($scope, DataService){
   $scope.candidates = DataService.candidates();
  
   $scope.isFocused = function(name){
      return $scope.focusedCandidate === name;
   };
   $scope.setFocused = function(name){
      console.log(name);
      $scope.focusedCandidate = name;
   };
   $scope.candidateChoose = function(n){
      console.log(n);
      $scope.focusedCandidateItem = n;
   }
   $scope.toggleSmallPary = function(){
      $scope.showSmallPartyOnly = !$scope.showSmallPartyOnly;
   };
   $scope.smallPartyFilter = function(n){
      if($scope.showSmallPartyOnly){
         if(n.partyEng !== 'KMT' && n.partyEng !== 'DPP'){
            return n;
         }
      }else{
         return n;
      }
   };
   $scope.togglePresent = function(){
      $scope.showPresent = !$scope.showPresent;
   };
   $scope.toggleSettings = function(){
      $scope.showSettings = !$scope.showSettings;
   };
   $scope.togglePartyName = function(){
      $scope.showPartyName = !$scope.showPartyName;
   };
   
   
}]);

app.controller('DistrictCtrl', ['$scope', 'DataService',function($scope, DataService){

  $scope.district = 'all';
  
  $scope.districts = DataService.getDistricts();

  $scope.selectDistrict = function(district){
    $scope.district = district;

  };
  $scope.getDistrictName = function(no){
    //return "text";
    var result = "unset";
    $.each($scope.districts, function(index,value){
        if(value.district_no == no){
           result = value.district_area;
        }

    });
    if(no=='all'||no=='search'){
       result = "所有選區";
    }
    return result;

  };
  $scope.isSelected = function(value){
    if(($scope.district === 'all')||( $scope.district === 'search')){
        return $scope.district === value;
    }else{
        return $scope.district.district_no === value;
    }

  };
  $scope.districtFilter = function(item){
    
    if(($scope.district === 'all')||( $scope.district === 'search')){
        return item;
    }else{
        if(item.district === $scope.district.district_no)
           return item;
    }
   
  };

}]);

app.controller('ReportCtrl', ['$scope', 'DataService', function ($scope, DataService){
    $scope.reports = DataService.getReports();
    $scope.candidates = DataService.getCandidatesObj();

    $scope.item = {};
    $scope.submitReport = function(){
        console.log("submit");
        DataService.pushReports($scope.item);
        $scope.item = {};
      
    };
    $scope.toggleForm = function(){
        $scope.showForm = !$scope.showForm;
    };
    $scope.districts = DataService.getDistrictsObj();
    $scope.getCouncilorDistrict = function(name){
        
        if($scope.candidates[name]){
          var district_no = $scope.candidates[name].district;
          if($scope.districts[district_no]){
             return $scope.districts[district_no].district_area;

          }
          

        }
        

    };
  

}]);


