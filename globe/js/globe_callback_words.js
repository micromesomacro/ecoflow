<!-- python3 -m http.server, localhost: -->
<!DOCTYPE html>
<html lang="en">
  <meta charset="utf-8">
  <header><title>globe first try</title></header>
  <style>
    canvas{width:100%;height:100%}
    body{
    font-family:Monospace;
    background-color:#000;
    color:#fff;
    margin:0px;
    overflow:hidden;
    }
    #info{
    position:absolute;
    top:10px;
    width:100%;
    text-align:center;
    z-index:100;
    display:block;
    }
    #info a, .button{color:#f00;font-weight:bold;text-decoration:underline;cursor:pointer}
    #footer{
    position:absolute;
    bottom:10px;
    width:100%;
    text-align:center;
    z-index:100;
    display:block;
    }
  </style>
  <body>
    <div id="info">
    <a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> - # publications with keyword in the title <a href="pascal.carrivain@ens-lyon.fr" target="_blank" rel="noopener">Pascal Carrivain</a> <a href="pascal.carrivain@ens-lyon.fr" target="_blank" rel="noopener">Titouan Poisson</a> <a href="pascal.carrivain@ens-lyon.fr" target="_blank" rel="noopener">Clément Renaud</a> & <a href="stephane.grumbach@ens-lyon.fr" target="_blank" rel="noopener">Stéphane Grumbach</a>
    <br/>click to change year, click to change keyword, drag to spin the globe, wheel to zoom in/out<br/>
    <span class="button" id="yearm1">year-1</span>,
    <span class="button" id="yearp1">year+1</span>,
    <span class="button" id="pkeyword">previous keyword</span>
    <span class="button" id="nkeyword">next keyword</span>
    <div id="WORD" style="font-size:40px;color:#00f">?</div>
    <div id="YEAR" style="font-size:40px;color:#00f">?</div>
    </div>
    <footer id="footer">
      <span id="tanom_land" style="font-size:20px;color:#f00">?</span>,
      <span id="tanom_ocean" style="font-size:20px;color:#f00">?</span>
    <!-- <div id="footer-content" style="font-size:40px;color:#f00">?</div> -->
    </footer>
    <!-- <script src="https://webglfundamentals.org/webgl/resources/webgl-utils.js"></script> -->
    <!-- <script src="http://api.geodab.eu/download/giapi/lib/min/giapi.min.js"></script> -->
    <!-- <script src="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"></script> -->
    <!-- <script src="https://threejs.org/build/Detector.js"></script> -->
    <script src="https://threejs.org/build/three.js"></script>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
    <div id="container"></div>
    <script type="text/javascript">
      
      <!-- <\!-- <\\!-- jQuery.crossOrigin=""; -\\-> -\-> -->
      <!-- <\!-- <\\!-- jQuery.getJSON("http://stats.oecd.org/sdmx-json/data/QNA/AUS+CAN.GDP+B1_GE.CUR+VOBARSA.Q/all?startTime=2010-M1&endTime=2017-M12",function(data){ -\\-> -\-> -->
      <!-- <\!-- jQuery.getJSON("http://stats.oecd.org/sdmx-json/data/QNA/AUS+CAN.GDP+B1_GE.CUR+VOBARSA.Q/all?startTime=2010-Q1&endTime=2017-Q1",function(data){ -\-> -->
      <!-- <\!-- <\\!-- jQuery.getJSON("http://stats.oecd.org/restsdmx/sdmx.ashx/GetData/QNA/AUS+CAN.GDP+B1_GE.CUR+VOBARSA.Q/all?startTime=2010-M1&endTime=2017-M12&format=compact_v2",function(data){ -\\-> -\-> -->
      <!-- <\!-- console.log(data); -\-> -->
      <!-- <\!-- console.log(data.getElementById('links')); -\-> -->
      <!-- <\!-- } -\-> -->
      <!-- <\!-- ); -\-> -->
      
      console.clear();
      <!-- if(!Detector.webgl) Detector.addGetWebGLMessage(); -->
      
      var count=1,delta_count=1,pt=new THREE.Vector3(),group_length=0,n_points=100,pairwize=[],pileups=[],group_mesh=new THREE.Group(),group_links=new THREE.Group(),group_pileups=new THREE.Group();
      var PreviousMouseX=0.0,PreviousMouseY=0.0,DraggingMouse=false;
      const ZoomSensitivity=0.0001;
      var vS,vT,mST=new THREE.Vector3(),cvS=new THREE.Vector3(),cvT=new THREE.Vector3(),geometry,material,min_weight=1000000,weighti=0.0,pileup_weight=0.2,source=0,target=0;
      var paths=new THREE.CurvePath();
      const radius0=2.5;
      const segments0=10;
      const rings0=10;
      var spherei=new THREE.SphereGeometry(radius0,segments0,rings0);
      var materiali=new THREE.MeshBasicMaterial({color:0xff00ff});
      var min_time=3000,time=1988,n_countries=0,theta,bn=new THREE.Vector3();
      var group_text=new THREE.Group();
      var loader_font=new THREE.FontLoader();
      var country,material_country,data_pubmed_graph;
      var rC=new THREE.Vector3(),LATi=0.0,LONi=0.0;
      var mesh_text;
      var i_word=0,n_words,words=[];
      
      <!-- make scene -->
      var scene=new THREE.Scene();
      scene.background=new THREE.Color(0x000000);
      <!-- make camera -->
      var Xcamera=0.0;
      var Ycamera=0.0;
      var Zcamera=1000.0;
      var Rcamera=Math.sqrt(Xcamera*Xcamera+Ycamera*Ycamera+Zcamera*Zcamera);
      var camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,10000);
      camera.position.set(Xcamera,Ycamera,Zcamera);
      camera.lookAt(new THREE.Vector3(0,0,0));
      scene.add(camera);
      <!-- make light -->
      var light=new THREE.PointLight(0xffffff);
      light.position.set(camera.position);
      light.lookAt(new THREE.Vector3(0,0,0));
      scene.add(light);
      <!-- make render -->
      var renderer=new THREE.WebGLRenderer({antialias:true});
      var container=document.getElementById('container');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth,window.innerHeight);
      container.appendChild(renderer.domElement);
      <!-- make globe -->
      const radius=200;
      const segments=100;
      const rings=100;
      var globe=new THREE.Group();
      <!-- Loading the world map texture -->
      var loader=new THREE.TextureLoader();
      loader.crossOrigin="";
      loader.load('https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57735/land_ocean_ice_cloud_2048.jpg',
      <!-- loader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_world_map.svg/2000px-Simple_world_map.svg.png', -->
      function(texture){
      var sphere=new THREE.SphereGeometry(radius,segments,rings);
      <!-- var material=new THREE.MeshBasicMaterial({map:texture,overdraw:0.5}); -->
      var material=new THREE.MeshBasicMaterial({map:texture,wireframe:false});
      var mesh=new THREE.Mesh(sphere,material);
      globe.add(mesh);
      },
      function(error){console.log(error)}
      );
      globe.position.set(0,0,0);

      <!-- https://www.ncdc.noaa.gov/cag/global/time-series/globe/land/ytd/12/2000-2018.json?trend=true&trend_base=10&firsttrendyear=1880&lasttrendyear=2017 -->
      temp_anom_land={"description":{"title":"Global Land Temperature Anomalies, January-December","units":"Degrees Celsius","base_period":"1901-2000","missing":-999},"data":{"2000":"0.62","2001":"0.81","2002":"0.92","2003":"0.88","2004":"0.79","2005":"1.03","2006":"0.90","2007":"1.08","2008":"0.85","2009":"0.87","2010":"1.07","2011":"0.89","2012":"0.90","2013":"0.98","2014":"1.00","2015":"1.34","2016":"1.44","2017":"1.31"}};
      <!-- https://www.ncdc.noaa.gov/cag/global/time-series/globe/ocean/ytd/12/2000-2018.json?trend=true&trend_base=10&firsttrendyear=1880&lasttrendyear=2017 -->
      temp_anom_ocean={"description":{"title":"Global Ocean Temperature Anomalies, January-December","units":"Degrees Celsius","base_period":"1901-2000","missing":-999},"data":{"2000":"0.35","2001":"0.44","2002":"0.48","2003":"0.51","2004":"0.49","2005":"0.51","2006":"0.50","2007":"0.43","2008":"0.42","2009":"0.55","2010":"0.56","2011":"0.46","2012":"0.51","2013":"0.55","2014":"0.64","2015":"0.74","2016":"0.76","2017":"0.67"}};
      
      <!-- graph of the pudmed -->
      function requestJSON(callback){
      var xhr=new XMLHttpRequest();
      xhr.responseType='json';
      xhr.onreadystatechange=function(){
      if(xhr.readyState===4 && (xhr.status===200 || xhr.status===0)){
      callback(xhr.response);
      }
      };
      xhr.open('GET','http://localhost:8000/all.json',true);
      <!-- xhr.setRequestHeader('Access-Control-Allow-Methods','GET'); -->
      <!-- xhr.setRequestHeader('Content-Type','application/json'); -->
      xhr.send(null);
      };
      
      function readJSON(data){
      data_graph_pubmed=data;
      <!-- reading the keywords -->
      n_words=data_graph_pubmed['keywords'].length;
      for(var i=0;i<n_words;i++) words.push(data_graph_pubmed['keywords'][i]['id']);
      word=words[i_word];
      console.log(words);
      document.getElementById('WORD').innerHTML=word;
      <!-- console.log(data_graph_pubmed); -->

      <!-- initial time -->
      for(var w=0;w<n_words;w++){
      pairwize.push(data_graph_pubmed[words[w]]['links'].length);
      pileups.push(data_graph_pubmed[words[w]]['pileups'].length);
      }
      for(var w=0;w<n_words;w++){
      for(var i=0;i<pairwize[w];i++) min_time=Math.min(min_time,data_graph_pubmed[words[w]]['links'][i]['time']);
      }
      time=min_time;
      document.getElementById('YEAR').innerHTML=time;
      document.getElementById('tanom_land').innerHTML='temperature anomaly land : '.concat(temp_anom_land['data'][time.toString()]);
      document.getElementById('tanom_ocean').innerHTML='temperature anomaly ocean : '.concat(temp_anom_ocean['data'][time.toString()]);
      console.log(min_time);
      
      <!-- making the countries (http://www.csgnetwork.com/llinfotable.html) SOUTH:- NORTH:+ and WEST:- EAST:+ -->
      n_countries=data_graph_pubmed['nodes'].length;
      console.log(n_countries);
      console.log(n_countries*(n_countries-1)/2);
      console.log(pairwize);
      console.log(pileups);
      for(var i=0;i<n_countries;i++){
	LATi=0.5*Math.PI-data_graph_pubmed['LL'][i]['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+data_graph_pubmed['LL'][i]['lon']*Math.PI/180.0;<!-- I do not understand the 0.5*Math.PI but at least it works -->
	rC=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi)).multiplyScalar(radius);
	if(i>=(n_countries-2)) country=new THREE.SphereGeometry(1.0,segments0,rings0);
	else country=new THREE.SphereGeometry(radius0,segments0,radius0);
	if(i===(n_countries-2)) material_country=new THREE.MeshBasicMaterial({color:0x0000ff});
	else{
	if(i===(n_countries-1)) material_country=new THREE.MeshBasicMaterial({color:0x00ff00});
	else material_country=new THREE.MeshBasicMaterial({color:0xff0000});
	}
	var mesh_country=new THREE.Mesh(country,material_country);
	mesh_country.position.set(rC.x,rC.y,rC.z);
	globe.add(mesh_country);
      }

      for(var i=0;i<pairwize[i_word];i++) min_weight=Math.min(min_weight,data_graph_pubmed[word]['links'][i]['value']);
	<!-- http://climatedataapi.worldbank.org/climateweb/rest/v1/country/annualanom/tas/1990/2000/USA.json -->
	<!-- https://datahelpdesk.worldbank.org/knowledgebase/articles/902061-climate-data-api -->
	<!-- https://www.ncdc.noaa.gov/cag/global/ -->
	<!-- making the paths between countries -->
	var j=0;
	for(var i=0;i<pairwize[i_word];i++){
	if(data_graph_pubmed[word]['links'][i]['time']===time){
	<!-- Starting and target points -->
	source=data_graph_pubmed['LL'][data_graph_pubmed[word]['links'][i]['source']];
	target=data_graph_pubmed['LL'][data_graph_pubmed[word]['links'][i]['target']];
	LATi=0.5*Math.PI-source['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+source['lon']*Math.PI/180.0;
	vS=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi));
	LATi=0.5*Math.PI-target['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+target['lon']*Math.PI/180.0;
	vT=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi));
	weighti=Math.log(data_graph_pubmed[word]['links'][i]['value'])/Math.log(2.0)+0.1;
	<!-- weighti=1.0; -->
	<!-- mid-point -->
	theta=Math.acos(vS.x*vT.x+vS.y*vT.y+vS.z*vT.z);
	console.log(theta);
	bn.x=vS.y*vT.z-vS.z*vT.y;
	bn.y=vS.z*vT.x-vS.x*vT.z;
	bn.z=vS.x*vT.y-vS.y*vT.x;
	bn.normalize();
	cvS=vS.clone();
	cvS.applyAxisAngle(bn,0.33*theta);
	cvS.multiplyScalar(radius*(1.0+weighti));
	cvT=vS.clone();
	cvT.applyAxisAngle(bn,0.66*theta);
	cvT.multiplyScalar(radius*(1.0+weighti));
	mST=vS.clone();
	mST.applyAxisAngle(bn,0.5*theta);
	mST.multiplyScalar(radius*(1.0+weighti));
	vS.multiplyScalar(radius);
	vT.multiplyScalar(radius);
	<!-- Bezier curves -->
	<!-- paths.add(new THREE.CubicBezierCurve3(vS,cvS,cvT,vT)); -->
	paths.add(new THREE.QuadraticBezierCurve3(vS,mST,vT));
	<!-- paths.add(new THREE.SplineCurve([vS,cvS,cvT,vT])); -->
      	geometry=new THREE.BufferGeometry().setFromPoints(paths.curves[j].getPoints(n_points));
	j=j+1;
	source=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['source']]['id'];
	target=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['target']]['id'];
      	if(target==='facebook' || source==='facebook') group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x0000ff})));
	else{
	if(target==='google' || source==='google') group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x00ff00})));
	else group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xff0000})));
	}
	}
        }
	<!-- making the pileup for each country -->
	for(var i=0;i<pileups[i_word];i++){
	if(data_graph_pubmed[word]['pileups'][i]['time']===time){
	<!-- Starting and target points -->
	source=data_graph_pubmed['LL'][data_graph_pubmed[word]['pileups'][i]['country']];
	LATi=0.5*Math.PI-source['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+source['lon']*Math.PI/180.0;
	vS=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi)).multiplyScalar(radius);
	weighti=Math.log(data_graph_pubmed[word]['pileups'][i]['value'])/Math.log(2.0);
	vT=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi)).multiplyScalar(radius*(1.0+pileup_weight*weighti));
	<!-- Lines -->
      	geometry=new THREE.Geometry();
	geometry.vertices.push(vS);
	geometry.vertices.push(vT);
	source=data_graph_pubmed[word]['pileups'][i]['country'];
      	if(source==='facebook') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x0000ff})));
	if(source==='google') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x00ff00})));
	if(source!='facebook' && source!='google') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xffffff})));
	}
	}
      <!-- making the time -->
      change_time();
      <!-- making the moving points -->
      for(var i=0;i<pairwize[i_word];i++) if(data_graph_pubmed[word]['links'][i]['time']===time) group_mesh.add(new THREE.Mesh(spherei,materiali));
      globe.add(group_links);
      globe.add(group_pileups);
      globe.add(group_mesh);
      scene.add(globe);

      document.addEventListener('mousemove',RotateOnMouseMove);
      document.addEventListener('mousedown',OnMouseDown);
      document.addEventListener('mouseup',function(e){DraggingMouse=false;});
      document.addEventListener('mousewheel',ZoomOnMouseWheel);
      document.addEventListener('keyup',MoveOnKeyboardKeys);
      <!-- document.addEventListener('keydown',MoveOnKeyboardKeys); -->
      document.getElementById('yearm1').addEventListener('click',function(){
      time-=1;
      time=Math.max(min_time,time);
      document.getElementById('YEAR').innerHTML=time;
      document.getElementById('tanom_land').innerHTML='temperature anomaly land : '.concat(temp_anom_land['data'][time]);
      document.getElementById('tanom_ocean').innerHTML='temperature anomaly ocean : '.concat(temp_anom_ocean['data'][time]);
      <!-- scene.remove(group_text.children[0]); -->
      <!-- group_text.remove(group_text.children[0]); -->
      change_time();
      change_links();
      },false);
      document.getElementById('yearp1').addEventListener('click',function(){
      time+=1;
      time=Math.min(2018,time);
      document.getElementById('YEAR').innerHTML=time;
      document.getElementById('tanom_land').innerHTML='temperature anomaly land : '.concat(temp_anom_land['data'][time]);
      document.getElementById('tanom_ocean').innerHTML='temperature anomaly ocean : '.concat(temp_anom_ocean['data'][time]);
      <!-- scene.remove(group_text.children[0]); -->
      <!-- group_text.remove(group_text.children[0]); -->
      change_time();
      change_links();
      },false);
      document.getElementById('pkeyword').addEventListener('click',function(){
      i_word-=1;
      if(i_word===-1) i_word=n_words-1;
      word=words[i_word];
      document.getElementById('WORD').innerHTML=word;
      change_links();
      },false);
      document.getElementById('nkeyword').addEventListener('click',function(){
      i_word+=1;
      if(i_word===n_words) i_word=0;
      word=words[i_word];
      document.getElementById('WORD').innerHTML=word;
      change_links();
      },false);
      };
      <!-- making the time text -->
      function change_time(){
      <!-- loader_font.load("https://threejs.org/examples/fonts/optimer_bold.typeface.json", -->
      loader_font.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      function(font){
      <!-- mesh_text=new THREE.Mesh(new THREE.TextGeometry((time.toString()).concat(" : # publications about ",word),{ -->
      mesh_text=new THREE.Mesh(new THREE.TextGeometry(time.toString(),{
      font:font,
      size:80,
      height:5,
      curveSegments:120,
      bevelEnabled:true,
      bevelThickness:1,
      bevelSize:8,
      bevelSegments:5
      }),new THREE.MeshBasicMaterial({color:0xffffff}));
      mesh_text.position.set(-1000.0,500.0,0.0);
      group_text.add(mesh_text);
      },
      function(error){
      console.log(error);
      });
      <!-- scene.add(group_text); -->
      };
      <!-- changing time -->
      function MoveOnKeyboardKeys(e){
      switch(e.keyCode){
      case 37:
      time-=1;
      break;
      case 39:
      time+=1;
      break;
      case 65:
      time+=1;
      break;
      case 90:
      time-=1;
      break;
      case 81:
      i_word+=1;
      break;
      case 83:
      i_word-=1;
      break;
      };
      i_word=Math.min(n_words-1,Math.max(0,i_word));
      word=words[i_word];
      document.getElementById('WORD').innerHTML=word;
      time=Math.min(2018,Math.max(min_time,time));
      document.getElementById('YEAR').innerHTML=time;
      <!-- scene.remove(group_text.children[0]); -->
      <!-- group_text.remove(group_text.children[0]); -->
      change_time();
      change_links();
      count=1;
      };
      <!-- making the new links and the new pileups -->
      function change_links(){
      <!-- making the pileup for each country -->
      var j=0;
      for(var i=0;i<pileups[i_word];i++){
      if(data_graph_pubmed[word]['pileups'][i]['time']===time){
      <!-- Starting and target points -->
      source=data_graph_pubmed['LL'][data_graph_pubmed[word]['pileups'][i]['country']];
      LATi=0.5*Math.PI-source['lat']*Math.PI/180.0;
      LONi=0.5*Math.PI+source['lon']*Math.PI/180.0;
      vS=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi)).multiplyScalar(radius);
      weighti=Math.log(data_graph_pubmed[word]['pileups'][i]['value'])/Math.log(2.0);
      vT=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi)).multiplyScalar(radius*(1.0+pileup_weight*weighti));
      <!-- Lines -->
      geometry=new THREE.Geometry();
      geometry.vertices.push(vS);
      geometry.vertices.push(vT);
      source=data_graph_pubmed[word]['pileups'][i]['country'];
      if(j<group_pileups.children.length){
	group_pileups.children[j].geometry=geometry;
        if(source==='facebook') group_pileups.children[j].material=new THREE.LineBasicMaterial({color:0x0000ff});
        if(source==='google') group_pileups.children[j].material=new THREE.LineBasicMaterial({color:0x00ff00});
        if(source!='facebook' && source!='google') group_pileups.children[j].material=new THREE.LineBasicMaterial({color:0xffffff});
      }else{
        if(source==='facebook') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x0000ff})));
        if(source==='google') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x00ff00})));
        if(source!='facebook' && source!='google') group_pileups.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xffffff})));
      }
      j=j+1;
      }
      }
      group_length=group_pileups.children.length;
      for(var i=(group_length-1);i>=j;i--){
      scene.remove(group_pileups.children[i]);
      group_pileups.remove(group_pileups.children[i]);
      }
      var j=0;
      for(var i=0;i<pairwize[i_word];i++){
	if(data_graph_pubmed[word]['links'][i]['time']===time){
	<!-- Starting and target points -->
	source=data_graph_pubmed['LL'][data_graph_pubmed[word]['links'][i]['source']];
	target=data_graph_pubmed['LL'][data_graph_pubmed[word]['links'][i]['target']];
	LATi=0.5*Math.PI-source['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+source['lon']*Math.PI/180.0;
	vS=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi));
	LATi=0.5*Math.PI-target['lat']*Math.PI/180.0;
	LONi=0.5*Math.PI+target['lon']*Math.PI/180.0;
	vT=new THREE.Vector3(Math.sin(LATi)*Math.sin(LONi),Math.cos(LATi),Math.sin(LATi)*Math.cos(LONi));
	weighti=Math.log(data_graph_pubmed[word]['links'][i]['value'])/Math.log(2.0)+0.1;
	<!-- weighti=1.0; -->
	<!-- mid-point -->
	theta=Math.acos(vS.x*vT.x+vS.y*vT.y+vS.z*vT.z);
	bn.x=vS.y*vT.z-vS.z*vT.y;
	bn.y=vS.z*vT.x-vS.x*vT.z;
	bn.z=vS.x*vT.y-vS.y*vT.x;
	bn.normalize();
	cvS=vS.clone();
	cvS.applyAxisAngle(bn,0.33*theta);
	cvS.multiplyScalar(radius*(1.0+weighti));
	cvT=vS.clone();
	cvT.applyAxisAngle(bn,0.66*theta);
	cvT.multiplyScalar(radius*(1.0+weighti));
	mST=vS.clone();
	mST.applyAxisAngle(bn,0.5*theta);
	mST.multiplyScalar(radius*(1.0+weighti));
	vS.multiplyScalar(radius);
	vT.multiplyScalar(radius);
	<!-- Bezier curves -->
	if(j<group_links.children.length){
	       <!-- paths.curves[j]=new THREE.CubicBezierCurve3(vS,cvS,cvT,vT); -->
	       paths.curves[j]=new THREE.QuadraticBezierCurve3(vS,mST,vT);
	       <!-- paths.curves[j]=new THREE.SplineCurve([vS,cvS,cvT,vT]); -->
      	       group_links.children[j].geometry=new THREE.BufferGeometry().setFromPoints(paths.curves[j].getPoints(n_points));
	       source=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['source']]['id'];
	       target=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['target']]['id'];
      	       if(target=='facebook' || source=='facebook') group_links.children[j].material=new THREE.LineBasicMaterial({color:0x0000ff});
	       else{
	       if(target=='google' || source=='google') group_links.children[j].material=new THREE.LineBasicMaterial({color:0x00ff00});
	       else group_links.children[j].material=new THREE.LineBasicMaterial({color:0xff0000});
	       }
	}else{
	       <!-- if(j<paths.curves.length) paths.curves[j]=new THREE.CubicBezierCurve3(vS,cvS,cvT,vT); -->
	       <!-- else paths.add(new THREE.CubicBezierCurve3(vS,cvS,cvT,vT)); -->
	       if(j<paths.curves.length) paths.curves[j]=new THREE.QuadraticBezierCurve3(vS,mST,vT);
	       else paths.add(new THREE.QuadraticBezierCurve3(vS,mST,vT));
	       <!-- if(j<paths.curves.length) paths.curves[j]=new THREE.SplineCurve([vS,cvS,cvT,vT]); -->
	       <!-- else paths.add(new THREE.SplineCurve([vS,cvS,cvT,vT])); -->
      	       geometry=new THREE.BufferGeometry().setFromPoints(paths.curves[j].getPoints(n_points));
	       source=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['source']]['id'];
	       target=data_graph_pubmed['nodes'][data_graph_pubmed[word]['links'][i]['target']]['id'];
      	       if(target=='facebook' || source=='facebook') group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x0000ff})));
	       else{
	       if(target=='google' || source=='google') group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x00ff00})));
	       else group_links.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xff0000})));
	       }
	}
	j=j+1;
	}
	}
	group_length=group_links.children.length;
	for(var i=(group_length-1);i>=j;i--){
	scene.remove(group_links.children[i]);
	group_links.remove(group_links.children[i]);
        }
      };
      <!-- Rotating mouse -->
      function OnMouseDown(e){
      DraggingMouse=true;
      PreviousMouseX=e.clientX;
      PreviousMouseY=e.clientY;
      }
      function RotateOnMouseMove(e){
      if(DraggingMouse){
      thetaX=Math.sign(e.clientX-PreviousMouseX)*0.075;
      thetaY=Math.sign(e.clientY-PreviousMouseY)*0.075;
      globe.rotation.x+=thetaY;
      globe.rotation.y+=thetaX;
      PreviousMouseX=e.clientX;
      PreviousMouseY=e.clientY;
      }
      }
      <!-- Zooming mouse -->
      function ZoomOnMouseWheel(e){
      <!-- console.log(e.wheelDelta); -->
      <!-- camera.fov+=e.wheelDelta*ZoomSensitivity; -->
      <!-- camera.projectionMatrix=new THREE.Matrix4().makePerspective(camera.fov,window.innerWidth/window.innerHeight,camera.near,camera.far); -->
      camera.position.set(camera.position.x,camera.position.y,camera.position.z-Math.sign(camera.position.z)*e.wheelDelta);
      camera.lookAt(new THREE.Vector3(0,0,0));
      };
      function render(){
		      if(count==n_points) delta_count=-1;
		      if(count==0) delta_count=1;
		      var j=0;
		      for(var i=0;i<pairwize[i_word];i++){
		      if(data_graph_pubmed[word]['links'][i]['time']==time){
		      if(j<group_mesh.children.length){
		      paths.curves[j].getPoint(count/n_points,pt);
		      group_mesh.children[j].position.set(pt.x,pt.y,pt.z);
		      }else{
		      paths.curves[j].getPoint(count/n_points,pt);
		      group_mesh.add(new THREE.Mesh(spherei,materiali));
		      group_mesh.children[j].position.set(pt.x,pt.y,pt.z);
		      }  
		      j=j+1;
		      }
		      }
		      group_length=group_mesh.children.length;
		      for(var i=(group_length-1);i>=j;i--){
		      scene.remove(group_mesh.children[i]);
		      group_mesh.remove(group_mesh.children[i]);
		      }
		      renderer.render(scene,camera);
		      count=count+delta_count;
      };
		      
      function update(){
      requestAnimationFrame(update);
      render();
      };
      update();
      requestJSON(readJSON);

    </script>
  </body>
</html>
