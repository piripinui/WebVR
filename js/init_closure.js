var l="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},n="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function r(){r=function(){};n.Symbol||(n.Symbol=t)}var w=0;function t(a){return"jscomp_symbol_"+(a||"")+w++}
function x(){r();var a=n.Symbol.iterator;a||(a=n.Symbol.iterator=n.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&l(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return y(this)}});x=function(){}}function y(a){var b=0;return z(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}function z(a){x();a={next:a};a[n.Symbol.iterator]=function(){return this};return a}
function A(a,b){x();a instanceof String&&(a+="");var c=0,f={next:function(){if(c<a.length){var d=c++;return{value:b(d,a[d]),done:!1}}f.next=function(){return{done:!0,value:void 0}};return f.next()}};f[Symbol.iterator]=function(){return f};return f}for(var F=n,G=["Array","prototype","values"],H=0;H<G.length-1;H++){var I=G[H];I in F||(F[I]={});F=F[I]}var J=G[G.length-1],N=F[J],O=N?N:function(){return A(this,function(a,b){return b})};O!=N&&null!=O&&l(F,J,{configurable:!0,writable:!0,value:O});
var viewer,locations={denver:new Cesium.Cartesian3(-1272209.292469148,-4751630.941108344,4063428.939909443),redrocks:new Cesium.Cartesian3(-1289792.3587257643,-4746245.525598164,4051013.2689858945),controller:Cesium.Cartesian3.fromDegrees(-75.62898254394531,40.02804946899414,0),denver_downtown:Cesium.Cartesian3.fromDegrees(-104.992089,39.761292,1E4),denver_downtown_tight:Cesium.Cartesian3.fromDegrees(-104.992089,39.761292,2500),denver_3d_buildings:Cesium.Cartesian3.fromDegrees(-104.999471,39.749217,
1800)},P=[],Q;function R(a){var b=viewer.terrainProvider,c=[Cesium.Cartographic.fromCartesian(locations[a])],b=Cesium.sampleTerrain(b,11,c);Cesium.when(b,function(b){Q=b[0].height;viewer.scene.camera.flyTo({destination:locations[a],orientation:{pitch:0}})})}
function init(){function a(a){return 180/Math.PI*a}function b(a){for(a+="";6>a.length;)a="0"+a;return a}function c(){console.log("Flying back to home position...");B.g()}var f=new Cesium.MapboxImageryProvider({mapId:"mapbox.streets"});new Cesium.BingMapsImageryProvider({url:"//dev.virtualearth.net",mapStyle:Cesium.BingMapsStyle.AERIAL_WITH_LABELS});viewer=new Cesium.Viewer("cesiumContainer",{vrButton:!0,baseLayerPicker:!1,imageryProvider:f,scene3DOnly:!0});viewer.terrainProvider=new Cesium.CesiumTerrainProvider({url:"https://assets.agi.com/stk-terrain/world",
requestVertexNormals:!0});viewer.scene.globe.depthTestAgainstTerrain=!0;viewer.scene.globe.m=!0;viewer.scene.u=!1;Cesium.GeoJsonDataSource.load("data/denver_small.json").then(function(a){viewer.dataSources.add(a);a=a.entities.values;var b=new Cesium.Color(.8,.8,.8,1);console.log("Processing "+a.length+" entities...");for(var d=0;d<a.length;d++){var c=a[d];c.polygon.material=b;c.polygon.outline=!1;c.polygon.height=c._properties.BASEELEV_M-20;c.polygon.extrudedHeight=c._properties.TOPELEV_M-20}console.log("Finished loading buildings...")});
var d=document.createElement("span");d.style.position="absolute";d.style.top="10px";d.style.left="10px";d.style.color="white";d.style["font-family"]="Courier New";d.style["z-index"]="999";d.textContent="Debug";viewer.container.appendChild(d);var B=viewer.scene.camera,M,u,v;(function(){function f(a){a={alpha:!1,preserveDrawingBuffer:a};h=k.getContext("webgl",a);if(!h&&(h=k.getContext("experimental-webgl",a),!h)){VRSamplesUtil.addError("Your browser does not support WebGL.");return}h.clearColor(.1,
.2,.3,1);h.enable(h.DEPTH_TEST);h.enable(h.CULL_FACE);new WGLUStats(h);window.addEventListener("resize",D,!1);D();window.requestAnimationFrame(E)}function K(){for(var b=navigator.getGamepads(),e=0;e<b.length;e++){var c=b[e];if(c&&"OpenVR Gamepad"==c.id&&c.a){if(c.a.position){var d=B.positionCartographic,d=Cesium.Cartesian3.fromDegrees(a(d.longitude),a(d.latitude),d.height-10),d=Cesium.Transforms.eastNorthUpToFixedFrame(d);M||(console.log("Loading the Vive controller model..."),M=viewer.scene.primitives.add(Cesium.i.s({url:"models/Vive_Controller_Body.glb",
modelMatrix:d,scale:1})))}P.push(c)}}}function C(){var a=e.b("left"),b=e.b("right"),d=a.f+b.f,a=a.c+b.c;B.g();console.log("HDM is displaying "+d+" pixels wide and "+a+" pixels high.");d=d/a*window.outerHeight;console.log("Resizing window...");window.resizeTo(d,window.outerHeight);e.v([{source:k}]).then(function(){K()},function(){VRSamplesUtil.addError("requestPresent failed.",2E3)})}function L(){e.isPresenting&&e.o().then(function(){},function(){VRSamplesUtil.addError("exitPresent failed.",2E3)})}
function S(){D();e.isPresenting?e.capabilities.hasExternalDisplay&&(VRSamplesUtil.h(m),m=VRSamplesUtil.addButton("Exit VR","E","media/icons/cardboard64.png","vricon",L)):e.capabilities.hasExternalDisplay&&(VRSamplesUtil.h(m),m=VRSamplesUtil.addButton("Enter VR","E","media/icons/cardboard64.png","vricon",C))}function D(){if(e&&e.isPresenting){var a=e.b("left"),b=e.b("right");k.width=2*Math.max(a.f,b.f);k.height=Math.max(a.c,b.c)}else k.width=k.offsetWidth*window.devicePixelRatio,k.height=k.offsetHeight*
window.devicePixelRatio}function E(){h.clear(h.COLOR_BUFFER_BIT|h.DEPTH_BUFFER_BIT);if(e)if(e.requestAnimationFrame(E),e.getFrameData(g),e.isPresenting){var c=viewer.scene.camera;if(g.a&&g.a.orientation){var f=function(a){var b;-.5>=g.a.orientation[a]&&-1<=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);.5<g.a.orientation[a]&&1>=g.a.orientation[a]&&(b=2.5*Math.PI-g.a.orientation[a]*Math.PI);0<g.a.orientation[a]&&.5>=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);0>g.a.orientation[a]&&
-.5<=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);return b},p=f(0),q=f(1),f=f(2)-Math.PI/2;0>f&&(f=2*Math.PI+f);u||(u=q);v||(v=p);if(!isNaN(q)&&!isNaN(p)&&!isNaN(f)){var m=p-v;c.lookRight(q-u);c.lookDown(m);c.setView({orientation:{heading:q,pitch:Math.PI/2-p,roll:f}});v=p;u=q;d.textContent="HMD Heading = "+b(a(q).toFixed(2))+", Camera heading= "+b(a(c.heading).toFixed(2))+", HMD pitch = "+b(a(p).toFixed(2))+", Camera pitch = "+b(a(c.pitch).toFixed(2))+", HMD roll = "+b(a(f).toFixed(2))+
", Camera roll = "+b(a(c.roll).toFixed(2))}}P=[];K();viewer.render();e.B()}else c=viewer.scene.camera,h.viewport(0,0,k.width,k.height),d.textContent="Camera heading = "+b(a(c.heading).toFixed(2))+", Camera pitch = "+b(a(c.pitch).toFixed(2))+", Camera roll = "+b(a(c.roll).toFixed(2)),viewer.render();else window.requestAnimationFrame(E),h.viewport(0,0,k.width,k.height),viewer.render()}var e=null,g=null,m=null,k=viewer.canvas,h=null;navigator.getVRDisplays?(g=new VRFrameData,navigator.getVRDisplays().then(function(a){console.log("Detected VR display: "+
a.length);0<a.length?(e=a[0],e.l=.1,e.j=1024,console.log("Adding buttons..."),VRSamplesUtil.addButton("Fly to Home","F",null,null,c),VRSamplesUtil.addButton("Fly to Redrocks","D",null,null,function(){R("redrocks")}),VRSamplesUtil.addButton("Fly to Denver Downtown","S",null,null,function(){R("denver_downtown_tight")}),VRSamplesUtil.addButton("Denver Downtown 3D Buildings","A",null,null,function(){R("denver_3d_buildings")}),VRSamplesUtil.addButton("Reset Pose","R",null,null,function(){e.A()}),e.capabilities.canPresent&&
(m=VRSamplesUtil.addButton("Enter VR","E","media/icons/cardboard64.png","vricon",C)),window.addEventListener("vrdisplaypresentchange",S,!1),window.addEventListener("vrdisplayactivate",C,!1),window.addEventListener("vrdisplaydeactivate",L,!1),f(e.capabilities.hasExternalDisplay)):(f(!1),VRSamplesUtil.addInfo("WebVR supported, but no VRDisplays found.",3E3))})):navigator.getVRDevices?(f(!1),VRSamplesUtil.addError("Your browser supports WebVR but not the latest version. See <a href='http://webvr.info'>webvr.info</a> for more info.")):
(f(!1),VRSamplesUtil.addError("Your browser does not support WebVR. See <a href='http://webvr.info'>webvr.info</a> for assistance."))})()}window.init=init;window.flytoLocation=R;window.gotoLocation=function(a){viewer.scene.camera.position=locations[a]};window.heightAtCameraPosition=Q;window.eyeSeparationOverride=void 0;
