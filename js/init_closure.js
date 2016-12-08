var l="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},n="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function r(){r=function(){};n.Symbol||(n.Symbol=t)}var w=0;function t(a){return"jscomp_symbol_"+(a||"")+w++}
function x(){r();var a=n.Symbol.iterator;a||(a=n.Symbol.iterator=n.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&l(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return y(this)}});x=function(){}}function y(a){var b=0;return z(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}function z(a){x();a={next:a};a[n.Symbol.iterator]=function(){return this};return a}
function A(a,b){x();a instanceof String&&(a+="");var c=0,f={next:function(){if(c<a.length){var d=c++;return{value:b(d,a[d]),done:!1}}f.next=function(){return{done:!0,value:void 0}};return f.next()}};f[Symbol.iterator]=function(){return f};return f}for(var B=n,G=["Array","prototype","values"],H=0;H<G.length-1;H++){var I=G[H];I in B||(B[I]={});B=B[I]}var J=G[G.length-1],K=B[J],O=K?K:function(){return A(this,function(a,b){return b})};O!=K&&null!=O&&l(B,J,{configurable:!0,writable:!0,value:O});
var viewer,P={B:new Cesium.Cartesian3(-1272209.292469148,-4751630.941108344,4063428.939909443),N:new Cesium.Cartesian3(-1289792.3587257643,-4746245.525598164,4051013.2689858945),controller:Cesium.Cartesian3.fromDegrees(-75.62898254394531,40.02804946899414,0),D:Cesium.Cartesian3.fromDegrees(-104.992089,39.761292,1E4),F:Cesium.Cartesian3.fromDegrees(-104.992089,39.761292,2500),C:Cesium.Cartesian3.fromDegrees(-104.999471,39.749217,1800)},Q=[],R;
function S(a){var b=viewer.terrainProvider,c=[Cesium.Cartographic.j(P[a])],b=Cesium.R(b,11,c);Cesium.T(b,function(b){R=b[0].height;viewer.scene.camera.flyTo({destination:P[a],orientation:{pitch:0}})})}
function init(){function a(a){return 180/Math.PI*a}function b(a){for(a+="";6>a.length;)a="0"+a;return a}function c(){console.log("Flying back to home position...");C.m()}var f=new Cesium.MapboxImageryProvider({mapId:"mapbox.streets"});new Cesium.BingMapsImageryProvider({url:"//dev.virtualearth.net",mapStyle:Cesium.BingMapsStyle.AERIAL_WITH_LABELS});viewer=new Cesium.Viewer("cesiumContainer",{vrButton:!0,baseLayerPicker:!1,imageryProvider:f,scene3DOnly:!0});viewer.terrainProvider=new Cesium.CesiumTerrainProvider({url:"https://assets.agi.com/stk-terrain/world",
requestVertexNormals:!0});viewer.scene.globe.depthTestAgainstTerrain=!0;viewer.scene.globe.I=!0;viewer.scene.L=!1;Cesium.GeoJsonDataSource.load("data/denver_small.json").then(function(a){viewer.dataSources.add(a);a=a.entities.values;var b=new Cesium.Color(.8,.8,.8,1);console.log("Processing "+a.length+" entities...");for(var d=0;d<a.length;d++){var c=a[d];c.polygon.material=b;c.polygon.outline=!1;c.polygon.height=c._properties.BASEELEV_M-20;c.polygon.extrudedHeight=c._properties.TOPELEV_M-20}console.log("Finished loading buildings...")});
var d=document.createElement("span");d.style.position="absolute";d.style.top="10px";d.style.left="10px";d.style.color="white";d.style["font-family"]="Courier New";d.style["z-index"]="999";d.textContent="Debug";viewer.container.appendChild(d);var C=viewer.scene.camera,N,u,v;(function(){function f(a){a={alpha:!1,preserveDrawingBuffer:a};h=k.getContext("webgl",a);if(!h&&(h=k.getContext("experimental-webgl",a),!h)){VRSamplesUtil.addError("Your browser does not support WebGL.");return}h.clearColor(.1,
.2,.3,1);h.enable(h.DEPTH_TEST);h.enable(h.CULL_FACE);new WGLUStats(h);window.addEventListener("resize",E,!1);E();window.requestAnimationFrame(F)}function L(){for(var b=navigator.getGamepads(),e=0;e<b.length;e++){var c=b[e];if(c&&"OpenVR Gamepad"==c.id&&c.a){if(c.a.position){var d=C.positionCartographic,d=Cesium.Cartesian3.fromDegrees(a(d.longitude),a(d.latitude),d.height-10),d=Cesium.Transforms.eastNorthUpToFixedFrame(d);N||(console.log("Loading the Vive controller model..."),N=viewer.scene.primitives.add(Cesium.s.K({url:"models/Vive_Controller_Body.glb",
modelMatrix:d,scale:1})))}Q.push(c)}}}function D(){var a=e.f("left"),b=e.f("right"),d=a.i+b.i,a=a.h+b.h;C.m();console.log("HDM is displaying "+d+" pixels wide and "+a+" pixels high.");d=d/a*window.outerHeight;console.log("Resizing window...");window.resizeTo(d,window.outerHeight);e.O([{source:k}]).then(function(){L()},function(){VRSamplesUtil.addError("requestPresent failed.",2E3)})}function M(){e.g&&e.J().then(function(){},function(){VRSamplesUtil.addError("exitPresent failed.",2E3)})}function T(){E();
e.g?e.c.l&&(VRSamplesUtil.o(m),m=VRSamplesUtil.b("Exit VR","E","media/icons/cardboard64.png","vricon",M)):e.c.l&&(VRSamplesUtil.o(m),m=VRSamplesUtil.b("Enter VR","E","media/icons/cardboard64.png","vricon",D))}function E(){if(e&&e.g){var a=e.f("left"),b=e.f("right");k.width=2*Math.max(a.i,b.i);k.height=Math.max(a.h,b.h)}else k.width=k.offsetWidth*window.devicePixelRatio,k.height=k.offsetHeight*window.devicePixelRatio}function F(){h.clear(h.COLOR_BUFFER_BIT|h.DEPTH_BUFFER_BIT);if(e)if(e.requestAnimationFrame(F),
e.M(g),e.g){var c=viewer.scene.camera;if(g.a&&g.a.orientation){var f=function(a){var b;-.5>=g.a.orientation[a]&&-1<=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);.5<g.a.orientation[a]&&1>=g.a.orientation[a]&&(b=2.5*Math.PI-g.a.orientation[a]*Math.PI);0<g.a.orientation[a]&&.5>=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);0>g.a.orientation[a]&&-.5<=g.a.orientation[a]&&(b=Math.PI/2-g.a.orientation[a]*Math.PI);return b},p=f(0),q=f(1),f=f(2)-Math.PI/2;0>f&&(f=2*Math.PI+f);
u||(u=q);v||(v=p);if(!isNaN(q)&&!isNaN(p)&&!isNaN(f)){var m=p-v;c.lookRight(q-u);c.lookDown(m);c.setView({orientation:{heading:q,pitch:Math.PI/2-p,roll:f}});v=p;u=q;d.textContent="HMD Heading = "+b(a(q).toFixed(2))+", Camera heading= "+b(a(c.heading).toFixed(2))+", HMD pitch = "+b(a(p).toFixed(2))+", Camera pitch = "+b(a(c.pitch).toFixed(2))+", HMD roll = "+b(a(f).toFixed(2))+", Camera roll = "+b(a(c.roll).toFixed(2))}}Q=[];L();viewer.render();e.S()}else c=viewer.scene.camera,h.viewport(0,0,k.width,
k.height),d.textContent="Camera heading = "+b(a(c.heading).toFixed(2))+", Camera pitch = "+b(a(c.pitch).toFixed(2))+", Camera roll = "+b(a(c.roll).toFixed(2)),viewer.render();else window.requestAnimationFrame(F),h.viewport(0,0,k.width,k.height),viewer.render()}var e=null,g=null,m=null,k=viewer.canvas,h=null;navigator.j?(g=new VRFrameData,navigator.j().then(function(a){0<a.length?(e=a[0],e.H=.1,e.G=1024,VRSamplesUtil.b("Fly to Home","F",null,null,c),VRSamplesUtil.b("Fly to Redrocks","D",null,null,
function(){S("redrocks")}),VRSamplesUtil.b("Fly to Denver Downtown","S",null,null,function(){S("denver_downtown_tight")}),VRSamplesUtil.b("Denver Downtown 3D Buildings","A",null,null,function(){S("denver_3d_buildings")}),VRSamplesUtil.b("Reset Pose","R",null,null,function(){e.P()}),e.c.A&&(m=VRSamplesUtil.b("Enter VR","E","media/icons/cardboard64.png","vricon",D)),window.addEventListener("vrdisplaypresentchange",T,!1),window.addEventListener("vrdisplayactivate",D,!1),window.addEventListener("vrdisplaydeactivate",
M,!1),f(e.c.l)):(f(!1),VRSamplesUtil.u("WebVR supported, but no VRDisplays found.",3E3))})):navigator.v?(f(!1),VRSamplesUtil.addError("Your browser supports WebVR but not the latest version. See <a href='http://webvr.info'>webvr.info</a> for more info.")):(f(!1),VRSamplesUtil.addError("Your browser does not support WebVR. See <a href='http://webvr.info'>webvr.info</a> for assistance."))})()}window.init=init;window.flytoLocation=S;window.gotoLocation=function(a){viewer.scene.camera.position=P[a]};
window.heightAtCameraPosition=R;window.eyeSeparationOverride=void 0;
