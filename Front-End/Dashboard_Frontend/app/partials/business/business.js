'use strict';

var businessModule = angular.module('myApp.business', ['ngRoute']);

businessModule.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/business', {
    templateUrl: 'partials/business/business.html',
    controller: 'businessCtrl'
  });
}]);

businessModule.controller('businessCtrl', ['$scope','$http','getTimeLineDataService', 'getGraphDataService', function($scope, $http, getTimeLineDataService, getGraphDataService) {

    var addedBugIds = [];
    var BugzillaLink = "http://10.1.1.14/bugzilla/buglist.cgi?quicksearch="
        
    $scope.addBug = function(BugId) {
       addedBugIds.push(BugId);
    };
    $scope.deleteBug = function(BugId) {
        var position = addedBugIds.indexOf(BugId);
        if ( ~position ) addedBugIds.splice(position, 1);
    };
        
    $scope.openBugzilla = function(BugId){
        if(BugId === -1){
            if(addedBugIds.length < 1){
                alert('Error : Please Select the bugs!');
            }
            else{
                var link = BugzillaLink;
                for(var i = 0; i < addedBugIds.length; i++)
                {
                    if(i !== addedBugIds.length-1){
                        link += addedBugIds[i];
                        link += "%2C%";
                    }
                    else{
                        link += addedBugIds[i];
                    }
                }
                window.open(link);
            }
        }
        else
        {
            var link = BugzillaLink;
            link += BugId;
            window.open(link);
        }
    };    
        
    $scope.BarChartIndex = 1;
    $scope.BarChartOpen = [];
    $scope.BarChartCloned = [];
    $scope.leftIndex = 1;
    $scope.rightIndex = 1;
    $scope.length;
    $scope.openData = [];
    $scope.clonedData = [];
    $scope.totalDates = [];
    $scope.BarChartDates = [];
    
    
    $scope.config={};
    $scope.typeOptions=["pie","bar","spline","step","area","area-step","area-spline"];
    $scope.config.type2=$scope.typeOptions[1];
    
    $scope.GenerateBarChart = function(){
        $scope.BarChartOpen = [];
        $scope.BarChartCloned = [];
        $scope.BarChartDates = [];
        
        if($scope.leftIndex === $scope.BarChartIndex){
            document.getElementById("ButtonPrevData").disabled = true;
        }
        if($scope.rightIndex === $scope.BarChartIndex){
            document.getElementById("ButtonNextData").disabled = true;
        }
        
        if($scope.rightIndex === $scope.BarChartIndex){
            for(var i =($scope.BarChartIndex-1)*10; i < $scope.length; i++){
                $scope.BarChartOpen.push($scope.openData[i]);
                $scope.BarChartCloned.push($scope.clonedData[i]);
                $scope.BarChartDates.push($scope.totalDates[i]);
            }
        }
        else{
            for(var i = ($scope.BarChartIndex-1)*10; i < $scope.BarChartIndex*10; i++){
                $scope.BarChartOpen.push(d.open[i]);
                $scope.BarChartCloned.push(d.cloned[i]);
                $scope.BarChartDates.push($scope.totalDates[i]);
            }
        }
        
        var config = {};
        config.bindto = '#chart';
        config.data = {};
        config.data.columns = [];
        //config.data.json = {};
        config.zoom = {enabled:true};
        config.data.x = 'x';
        var barchartdates = $scope.BarChartDates;
        barchartdates.unshift('x');
        config.data.columns.push(barchartdates);
        $scope.BarChartOpen.unshift('open');
        $scope.BarChartCloned.unshift('Clonedopen');
        config.data.columns.push($scope.BarChartOpen);
        config.data.columns.push($scope.BarChartCloned);
        config.axis = {
                    rotated: false,
                    x: {
                        type: 'category',
                        tick: {
                            format: '%Y-%m-%d',
                        },
                        label: {
                            text: 'Dates',
                            position: 'outer-middle'
                        }
                    },
                    y: {
                        padding: {
                            top:300
                        }
                    }
                };
        config.data.types={"open":$scope.config.type2,"Clonedopen":$scope.config.type2};
        $scope.chart = c3.generate(config);
    };
    
    $scope.PreviousDataBarChart = function(){
       $scope.BarChartIndex--;
       $scope.GenerateBarChart();
    };
    
    $scope.NextDataBarChart = function(){
       $scope.BarChartIndex++; 
       $scope.GenerateBarChart();
    };
    
    $scope.showGraph = function(number) {
        var config = {};
        getGraphDataService.async(number).then(function(d) {
            $scope.length = d.open.length;
            $scope.openData = d.open;
            $scope.clonedData = d.cloned;
            $scope.totalDates = d.dates;
            console.log('length - '+d.open.length);
            if($scope.length%10 === 0){
                $scope.rightIndex = $scope.length/10;
            }
            else{
                $scope.rightIndex = ($scope.length/10) + 1;
                $scope.rightIndex = parseInt($scope.rightIndex, 10);
            }
            
            $scope.BarChartIndex = $scope.rightIndex;
            $scope.GenerateBarChart();
            config = {};
            config.data = {};
            config.pie = {};
            config.data.type='pie';
            config.pie.label = {};
            config.pie.label.format = function(value,ratio,id){
                return value;
            };
            config.legend = {};
            config.legend.show = false;

            config.bindto = '#assigned';
            config.data.columns = [];
            for(var i = 0;i < d.assignedopenedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.assignee[i]);
                config.data.columns[i].push(d.assignedopenedBugs[i]);
            }
            c3.generate(config);

            config.bindto = '#customer';
            config.data.columns = [];
            for(var i = 0;i < d.customeropenedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.customers[i]);
                config.data.columns[i].push(d.customeropenedBugs[i]);
            }        
            c3.generate(config);

            config.bindto = '#components';
            config.data.columns = [];
            for(var i = 0;i < d.componentopenedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.components[i]);
                config.data.columns[i].push(d.componentopenedBugs[i]);
            }
            c3.generate(config);

            config.bindto = '#assignedcloned';
            config.data.columns = [];
            for(var i = 0;i < d.assignedclonedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.assignee[i]);
                config.data.columns[i].push(d.assignedclonedBugs[i]);
            }
            c3.generate(config);

            config.bindto = '#customercloned';
            config.data.columns = [];
            for(var i = 0;i < d.customerclonedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.customers[i]);
                config.data.columns[i].push(d.customerclonedBugs[i]);
            }
            c3.generate(config);

            config.bindto = '#componentscloned';
            config.data.columns = [];
            for(var i = 0;i < d.componentclonedBugs.length;i++){
                config.data.columns.push([]);
                config.data.columns[i].push(d.components[i]);
                config.data.columns[i].push(d.componentclonedBugs[i]);
            }
            c3.generate(config); 
        });   
    };
    
    $scope.timelineConfig = {};
    var colorArray = [];
    var features = [];
    var defects = [];
    var dates = [];
    $scope.MilestoneData = {};
    $scope.MilestoneData.featuredates = [];
    $scope.MilestoneData.defectdates = [];
    $scope.MilestoneData.defectbugs = [];
    $scope.MilestoneData.featurebugs = [];
    
    $scope.chart;    
        
    $scope.timelineConfig.bindto = '#timeline';
    $scope.timelineConfig.axis = {
                            rotated: false,
                            x: {
                                type: 'category',
                                tick: {
                                    format: '%Y-%m-%d',
                                    multiline : true
                                },
                                label: {
                                    text: 'Dates',
                                    position: 'outer-middle'
                                }
                            },
                            y: {
                                show:false,
                                padding: {
                                    top:300
                                }
                            }
                        };
    $scope.timelineConfig.grid = {
                                    y: {
                                        show: true
                                    },
                                    x: {
                                        show: true
                                    }
                                 };
    $scope.timelineConfig.data = {};
    
    $scope.indexofSelectedMilestone = 0;
    $scope.selectedMilestonefeatures = [];
    $scope.selectedMilestonedefects = [];
    $scope.selectedMilestonefeaturescolorArray = [];
    $scope.selectedMilestonedefectscolorArray = [];
    $scope.DateofSelectedMilestone = dates[0];
    $scope.selectedMilestonefeaturesDates = [];
    $scope.selectedMilestonedefectsDates = [];
    $scope.showTimeLineData = false;
    
    $scope.$watch(function(scope) { return $scope.selectedMilestonefeaturescolorArray },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
       
    $scope.$watch(function(scope) { return $scope.selectedMilestonedefectscolorArray },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
    
    $scope.$watch(function(scope) { return $scope.showTimeLineData },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
    
    $scope.$watch(function(scope) { return $scope.DateofSelectedMilestone },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
    
    $scope.$watch(function(scope) { return $scope.selectedMilestonedefects },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
       
    $scope.$watch(function(scope) { return $scope.selectedMilestonefeatures },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       );
       
    $scope.$watch(function(scope) { return $scope.selectedMilestonefeaturesDates },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       ); 
       
    $scope.$watch(function(scope) { return $scope.selectedMilestonedefectsDates },
        function(newValue, oldValue) {
            document.getElementById("dateheading").innerHTML =
                "Date - " + newValue + "";
        }
       ); 
       
    $scope.timelineConfig.data.onclick = function(d, element){
        addedBugIds = [];
        $scope.showSelectedMilestoneData(d, element);
    };
    
    
    $scope.showSelectedMilestoneData = function(d, element){
        $scope.indexofSelectedMilestone = d.index;
        $scope.DateofSelectedMilestone = dates[d.index+1];
        $scope.selectedMilestonefeatures = [];
        $scope.selectedMilestonefeaturescolorArray = [];
        $scope.selectedMilestonedefectscolorArray = [];
        $scope.selectedMilestonedefects = [];
        $scope.selectedMilestonefeaturesDates = [];
        $scope.selectedMilestonedefectsDates = [];
        $scope.showTimeLineData = true;
        $scope.$digest();
        
        var featurebug = "";
        var trimmedfeaturebugs = $scope.MilestoneData.featurebugs[d.index].replace(/ /g,'');
        for(var i = 0; i < trimmedfeaturebugs.length; i++){
            if(trimmedfeaturebugs[i] !== ","){
                featurebug += trimmedfeaturebugs[i];
            }
            else
            {
                $scope.selectedMilestonefeatures.push(featurebug);
                featurebug = "";
            }
            if(i === trimmedfeaturebugs.length-1)
            {
                $scope.selectedMilestonefeatures.push(featurebug);
                featurebug = "";
            }
        }
        
        var featurebugDate = "";
        var trimmedfeaturebugsDates = $scope.MilestoneData.featuredates[d.index].replace(/ /g,'');
        for(var i = 0; i < trimmedfeaturebugsDates.length; i++){
            if(trimmedfeaturebugsDates[i] !== ","){
                featurebugDate += trimmedfeaturebugsDates[i];
            }
            else
            {
                $scope.selectedMilestonefeaturesDates.push(featurebugDate);
                var bugdate = new Date(featurebugDate);
                var currentdate = new Date($scope.DateofSelectedMilestone);
                if(bugdate <= currentdate)
                    $scope.selectedMilestonefeaturescolorArray.push("green");
                else
                    $scope.selectedMilestonefeaturescolorArray.push("red");
                featurebugDate = "";
            }
            if(i === trimmedfeaturebugsDates.length-1)
            {
                $scope.selectedMilestonefeaturesDates.push(featurebugDate);
                var bugdate = new Date(featurebugDate);
                var currentdate = new Date($scope.DateofSelectedMilestone);
                if(bugdate <= currentdate)
                    $scope.selectedMilestonefeaturescolorArray.push("green");
                else
                    $scope.selectedMilestonefeaturescolorArray.push("red");
                featurebugDate = "";
            }
        }
        
        var defectbugDate = "";
        var trimmeddefectbugsDates = $scope.MilestoneData.defectdates[d.index].replace(/ /g,'');
        for(var i = 0; i < trimmeddefectbugsDates.length; i++){
            if(trimmeddefectbugsDates[i] !== ","){
                defectbugDate += trimmeddefectbugsDates[i];
            }
            else
            {
                $scope.selectedMilestonedefectsDates.push(defectbugDate);
                var bugdate = new Date(defectbugDate);
                var currentdate = new Date($scope.DateofSelectedMilestone);
                if(bugdate <= currentdate)
                    $scope.selectedMilestonedefectscolorArray.push("green");
                else
                    $scope.selectedMilestonedefectscolorArray.push("red");
                defectbugDate = "";
            }
            if(i === trimmeddefectbugsDates.length-1)
            {
                $scope.selectedMilestonedefectsDates.push(defectbugDate);
                var bugdate = new Date(defectbugDate);
                var currentdate = new Date($scope.DateofSelectedMilestone);
                if(bugdate <= currentdate)
                    $scope.selectedMilestonedefectscolorArray.push("green");
                else
                    $scope.selectedMilestonedefectscolorArray.push("red");
                defectbugDate = "";
            }
        }
        
        var defectbug = "";
        var trimmeddefectbugs = $scope.MilestoneData.defectbugs[d.index].replace(/ /g,'');
        for(var i = 0; i < trimmeddefectbugs.length; i++){
            if(trimmeddefectbugs[i] !== ","){
                defectbug += trimmeddefectbugs[i];
            }
            else
            {
                $scope.selectedMilestonedefects.push(defectbug);
                defectbug = "";
            }
            if(i === trimmedfeaturebugs.length-1)
            {
                $scope.selectedMilestonedefects.push(defectbug);
                defectbug = "";
            }
        }
        
        $scope.$digest();
    };
    
    
    $scope.timelineConfig.subchart = {
                                        show : true
                                     };
    $scope.timelineConfig.zoom = {
                                    enabled : true
                                 };
    $scope.timelineConfig.data.x = 'x';
    $scope.timelineConfig.data.color = function(color,d){
                                    return colorArray[d.index];    
                                };
    $scope.timelineConfig.data.onmouseover = function (d, i) { };
    
    $scope.timelineConfig.tooltip = {
        format: {
            title: function (d) {
                var format = d3.time.format('%d/%m/%Y');
                return format(d);
            }
        },
        grouped: false,
        position: function (data, width, height, element) {
            var chartOffsetX = document.querySelector("#timeline").getBoundingClientRect().left;
            var graphOffsetX = document.querySelector("#timeline g.c3-axis-y").getBoundingClientRect().right;
            var tooltipWidth = document.getElementById('tooltip').parentNode.clientWidth;
            var x = (parseInt(element.getAttribute('cx')) ) + graphOffsetX - chartOffsetX - Math.floor(tooltipWidth/2);
            var y = element.getAttribute('cy');
            var y = y - height - 14;
            return {top: y, left: x};
          }
    };
    
    $scope.timelineConfig.tooltip.contents = function (data, defaultTitleFormat, defaultValueFormat, color) {
        var $$ = this, config = $$.config,
        titleFormat = config.tooltip_format_title || defaultTitleFormat,
        nameFormat = config.tooltip_format_name || function (name) { return name; },
        valueFormat = config.tooltip_format_value || defaultValueFormat,
        text, i, title, value;
        text = "<div id='tooltip' class='d3-tip'>";
        title = dates[data[0].index+1];
        console.log('Index - '+data[0].index);
        text += "<span class='info'><b><u>Date</u></b></span><br>";
        text += "<span class='info'>"+ title +"</span><br>";
        text += "<span class='info'><b><u>Features</u> : </b> " + features[data[0].index] + "</span><br>";
        text += "<span class='info'><b><u>Defects</u> : </b> " + defects[data[0].index] + "</span><br>";
        text += "</div>";
        return text;
    };   
    
    $scope.timelineConfig.data.columns = [
                                      [],
                                      []
                                  ];
    var i;
    
    $scope.makeTree = function(){

        var margin = {
            top: 20,
            right: 120,
            bottom: 20,
            left: 120
        },
        width = 960 - margin.right - margin.left,
        height = 800 - margin.top - margin.bottom;

        var i = 0,
            duration = 750,
            root;

        var tree = d3.layout.tree()
            .size([height, width]);

        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
            return [d.y, d.x];
        });

        var svg = d3.select(".branchtree").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        //d3.json("https://gist.githubusercontent.com/mbostock/1093025/raw/a05a94858375bd0ae023f6950a2b13fac5127637/flare.json", function(error, flare) {
        d3.json("http://192.168.137.3:8084/project_manage_dashboard/webresources/business/tree", function(error, flare) { 
        if (error) throw error;

          root = flare.root;
          root.x0 = height / 2;
          root.y0 = 0;

          function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          root.children.forEach(collapse);
          update(root);
        });

        d3.select(self.frameElement).style("height", "800px");
        
        function zoomed() {
            svg.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ")");
        }
        
        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 180; });

          // Update the nodes…
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);

          nodeEnter.append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff";})

          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
              .attr("dy", "1em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) {
                  var res =d.name + ', ActiveCount - ' + d.activecount;
                  return res; 
                })
              .style("fill-opacity", 1e-6);

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 4.5)
              .style("fill", function(d) { return d._children ? "blue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
               var link = svg.selectAll("path.link")
                    .data(links, function (d) {
                    return d.target.id;
                });

          // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                  .attr("class", function (d) {
                      var myClass = ((d.target.active === "false") ? "" : " link2");
                      return "link" + myClass;
                  })
                  .on("click", TimeLine)
                  .attr("d", function (d) {
                  var o = {
                      x: source.x0,
                      y: source.y0
                  };
                  return diagonal({
                      source: o,
                      target: o
                  });
              });

              // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }

        $scope.branchName;
        $scope.setTimeLineData = function(TimeLineData){
            colorArray = TimeLineData.colorArray;
            features = TimeLineData.featurescount;
            defects = TimeLineData.defectscount;
            dates = TimeLineData.dates;
            $scope.MilestoneData.featuredates = TimeLineData.featuresdates;
            $scope.MilestoneData.defectdates = TimeLineData.defectsdates;
            $scope.MilestoneData.featurebugs = TimeLineData.features;
            $scope.MilestoneData.defectbugs = TimeLineData.defects;
            $scope.timelineConfig.data.columns[0] = TimeLineData.dates;
            $scope.timelineConfig.data.columns[1] = [];
            for(i = 0; i < features.length; i++){
                $scope.timelineConfig.data.columns[1].push(30);
            }
            $scope.timelineConfig.data.columns[0].unshift('x');
            $scope.timelineConfig.data.columns[1].unshift('TimeLine');
            c3.generate($scope.timelineConfig);
        };
        
        function TimeLine(d){
            console.log(d.target);
            $scope.showGraph(d.target.branchid);
            $scope.branchName = d.target.name;
            getTimeLineDataService.getTimeLineData(d.target.branchid).success(function(response){
                $scope.setTimeLineData(response);
            });  
        }
    };
    $scope.ShowTimeLine = function(data){
        $scope.branchName = "MTAS-9.1";
        if(data === 0){
            getTimeLineDataService.getTimeLineData(6).success(function(response){
              $scope.setTimeLineData(response);
            });
        }
    };
}]);

businessModule.service('getTimeLineDataService', ['$rootScope','$http', function($rootScope, $http){
    this.getTimeLineData=function(num){
        var link = "http://192.168.137.3:8084/project_manage_dashboard/webresources/business/getTimeline/";
        link += num;
        return $http.get(link);
        //return $http.get('http://localhost:8383/Dashboard_Frontend/milestonesdata.json');
    };
}]);

businessModule.factory('getGraphDataService', function($http) {
  var urlString = "http://192.168.137.3:8084/project_manage_dashboard/webresources/business/monthlyBar/7";
    var getGraphDataService = {
    async: function(num) {
      var promise = $http.get(urlString+'/'+num).then(function (response) {
        return response.data;
      });
      return promise;
    }
  };
  return getGraphDataService;
});