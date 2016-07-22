var tcsites;
var trafxsites
var myLineChart;
var myPieChart;
var gdata;
var modes;
var sitelist;

$(document).ready(function() {

	$(function() {
		$("#dialog").dialog({
			autoOpen: false
		});
	});
    
    //$(".dialog").dialog('option','title', 'yah');
    
    sitelist = [];

    var map = L.map('map', {
        center: [45.5, -122.65],
        zoom: 10
        });
        
    var subDomains = ['gistiles1', 'gistiles2', 'gistiles3', 'gistiles4'];
    
    var base_simple = new L.TileLayer('http://gis.oregonmetro.gov/ArcGIS/rest/services/metromap/baseSimple/MapServer/tile/{z}/{y}/{x}/?token=GYJZSQrfbb8YrZ_RIn-64Kc1SpybpK4LpW4TenvGQmk.', {
        maxZoom: 19,
        zIndex: 10,
        subdomains: subDomains,
        attribution: '<a href="http://www.oregonmetro.gov/tools-partners/data-resource-center" target="_blank">Metro RLIS</a>'
    }).addTo(map);
    
    var trails = new L.TileLayer('http://gis.oregonmetro.gov/services/trailsExisting/{z}/{x}/{y}.png', {
        maxZoom: 19,
        zIndex: 60,
        subdomains: subDomains,
        attribution: '<a href="http://www.oregonmetro.gov/tools-partners/data-resource-center" target="_blank">Metro RLIS</a>'
    });
    
    var mAerial = new L.TileLayer('//gis.oregonmetro.gov/ArcGIS/rest/services/photo/2014aerialphoto/MapServer/tile/{z}/{y}/{x}/?token=GYJZSQrfbb8YrZ_RIn-64Kc1SpybpK4LpW4TenvGQmk.', {
        maxZoom: 19,
        attribution: '<a href="http://www.oregonmetro.gov/tools-partners/data-resource-center" target="_blank">Metro RLIS</a>'
    });
    
	var osmbase = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	});
    
    var tcsites = L.geoJson(tc,{
        style: function(feature){
            return {radius: calcPropRadius(feature.properties['avg'])};
        },
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				fillColor: "#708598",
				color: "#537898",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			}).on({
                    mouseover: function(e) {
                        //this.openPopup();
                        this.setStyle({color: 'yellow'});
                    },
                    mouseout: function(e) {
                        //this.closePopup();
                        this.setStyle({color: '#537898'});
                    }
                    //,click: function(e){
                        //alert(e.latlng);
                        //this.setStyle({fillColor: 'white'});
                    //}
                });
		}
		,onEachFeature: openPopup
	}).addTo(map);
    
    var trafxsites = L.geoJson(trafxs,{
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				radius: 5,
				fillColor: "#EF7500",
				color: "#537898",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			}).on({
                    mouseover: function(e) {
                        this.setStyle({color: 'yellow'});
                    },
                    mouseout: function(e) {
                        this.setStyle({color: '#537898'});
                    }
                });
		}
		,onEachFeature: openPopup2
	});
    
    function calcPropRadius(attributeValue) {
        var scaleFactor = 2;
        var size = attributeValue * scaleFactor;
        return Math.sqrt(size/Math.PI)*1.5;
    }
    
	function openPopup(feature, layer) {
		var popupContent = "Site: " + feature.properties.SITEID; 
        //+ "<br/> Location: " + feature.properties.LOCATION + 
        //"<br/> 2hr Avg: " + feature.properties['avg'];
		layer.bindPopup(popupContent);
        //grab data for graph
        var gdata = "["+feature.properties['weyr08']+","+feature.properties['weyr09']+","+feature.properties['weyr10']+","+feature.properties['weyr11']+","+feature.properties['weyr12']+","+feature.properties['weyr13']+","+feature.properties['weyr14']+"]";
        var gdata2 = "["+feature.properties['wdyr08']+","+feature.properties['wdyr09']+","+feature.properties['wdyr10']+","+feature.properties['wdyr11']+","+feature.properties['wdyr12']+","+feature.properties['wdyr13']+","+feature.properties['wdyr14']+"]";
        var modes = "["+feature.properties['PERCENTB']+","+feature.properties['PERCENTP']+","+feature.properties['PERCENTO']+"]";
        //call create graph function
        var siteid = feature.properties.SITEID + " : " + feature.properties.LOCATION;
        layer.on('click', function(e){cg(siteid, gdata, gdata2, modes);});
        sitelist.push(siteid+","+layer.getLatLng());
        
	}    
    
    function openPopup2(feature, layer){
        var pContent = "Site: " + feature.properties.Site
        layer.bindPopup(pContent);
        var td = "["+feature.properties['jan']+","+feature.properties['feb']+","+feature.properties['mar']+","+feature.properties['apr']+","+feature.properties['may']+","+feature.properties['jun']+","+feature.properties['july']+","+feature.properties['aug']+","+feature.properties['sept']+","+feature.properties['oct']+","+feature.properties['nov']+"]";
        layer.on('click', function(e){cg2(td);});
    }
	var baseLayers = {
        "Metro Basemap": base_simple,
        "OSM Basemap": osmbase,
        "2014 Metro Aerial": mAerial
	};
    
    var overlays = {
	"Trail Count Sites": tcsites,
    "TraFx Sites": trafxsites,
    "Existing Trails": trails
	};
    
	L.control.layers(baseLayers, overlays).addTo(map);
   
    $(function() {
        $('#slider').slider({
            value: 2008,
            min: 2008,
            max: 2014,
            step: 1,
            slide: function(event, ui){
                //there has got to be a better way, why can't equal itself plus value?
                $('#year').html('Year '.bold() + ui.value);
                updatesymbols(ui.value);
            }
        });
    });
    
    function updatesymbols(year){
        tcsites.setStyle(function(feature){
            if (year == 2008){
                return{radius: calcPropRadius(feature.properties['weyr08']+feature.properties['wdyr08'])};
            }
            else if (year == 2009){
                return{radius: calcPropRadius(feature.properties['weyr09']+feature.properties['wdyr09'])};;
            }
            else if (year == 2010){
                return{radius: calcPropRadius(feature.properties['weyr10']+feature.properties['wdyr10'])};
            }
            else if (year==2011){
                return{radius: calcPropRadius(feature.properties['weyr11']+feature.properties['wdyr11'])};
            }
            else if (year==2012){
                return{radius: calcPropRadius(feature.properties['weyr12']+feature.properties['wdyr12'])};
            }
            else if (year==2013){
                return{radius: calcPropRadius(feature.properties['weyr13']+feature.properties['wdyr13'])};
            }
            else if (year==2014){
                return{radius: calcPropRadius(feature.properties['weyr14']+feature.properties['wdyr14'])};
            }
            else {
                return{radius: calcPropRadius(feature.properties[year])};
            }
    });
    }

    function cg(siteid, gdata, gdata2, modes){
        //alert(gdata+"-"+typeof(gdata));
        $("#dialog").dialog('option','title','Site ' + siteid);
		$("#dialog").dialog("open");
        
        var adata = JSON.parse(gdata);
        var adata2 = JSON.parse(gdata2);
        var mdata = JSON.parse(modes);
        
        //console.log(par);
        
        var data = {
            labels: ["2008", "2009", "2010", "2011", "2012", "2013", "2014"],
            datasets: [
                {
                    label: "Weekend 2hr Avg",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: adata
                },
                {
                    label: "Weekday 2hr Avg",
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: adata2
                }
            ]
        };
        
        var piedata =[
                    {
                        value: Math.round(mdata[0]*100),
                        color:"#F7464A",
                        highlight: "#FF5A5E",
                        label: "Percent Bikes"
                    },
                    {
                        value: Math.round(mdata[1]*100),
                        color: "#46BFBD",
                        highlight: "#5AD3D1",
                        label: "Percent Peds"
                    },
                    {
                        value: Math.round(mdata[2]*100),
                        color: "#FDB45C",
                        highlight: "#FFC870",
                        label: "Percent Other"
                    }
                ];
                
        var options = {animationEasing: "easeOutQuart"};
        var baroptions = {multiTooltipTemplate: "<%=datasetLabel%> : <%= value %>"}
                
        var ctx = $("#myChart").get(0).getContext("2d");
        var ctx2 = $("#myPieChart").get(0).getContext("2d");
        if (window.myLineChart){
            window.myLineChart.destroy();
        }
        if (window.myPieChart){
            window.myPieChart.destroy();
        }
        
        //myLineChart = new Chart(ctx).Line(data);
        myLineChart = new Chart(ctx).Bar(data, baroptions);        
        myPieChart = new Chart(ctx2).Pie(piedata, options);
  
        //var legend = myPieChart.generateLegend();
        //$('#pielegend').append(legend);
        };
        
    function cg2(tdata){
        var trafxd = JSON.parse(tdata);
        
        var data = {
            labels: ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov"],
            datasets: [
                {
                    label: "2 Hour Average",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: trafxd
                }
            ]
        };
                
        var ctx = $("#myChart").get(0).getContext("2d");
        if (window.myLineChart){
            window.myLineChart.destroy();
        }

        myLineChart = new Chart(ctx).Bar(data);
        window.myPieChart.destroy();
        };

    $('#checkb').click(function(){
        if (this.checked){
            $('#slider').slider('disable');
            updatesymbols('avg');
        }
        else {
            $('#slider').slider('enable');
            updatesymbols($('#slider').slider("value"));
        }
    });
    
    //Used to populate the select options
    $(function (){
        for(val in sitelist.sort(jQuery.unique(sitelist))){
		$('#CountSites').append('<option value="'+sitelist[val]+'">'+sitelist[val]+"</option>");
		}
    })

    //$('#CountSites').on('change', function(){alert(this.value);});
    $('#CountSites').on('change', function(feature){
        for (feature in tcsites){
            if (feature.properties.SITEID = 418){
                alert('hi');
            }
            else{
                alert('no');
            }
        }
    });

//END OF ON READY
});