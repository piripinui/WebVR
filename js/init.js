var viewer,
cesiumVR,
globalFo=6371172.35,
//globalFocalLength = -160000000;
globalFocalLength = -5000000,
projNear = 1, projFar = 500000000,
lastGoodHeight,
locations = {
	denver: new Cesium.Cartesian3(-1272209.292469148, -4751630.941108344, 4063428.939909443),
	redrocks: new Cesium.Cartesian3(-1289792.3587257643, -4746245.525598164, 4051013.2689858945)
};

function newWindowRetest() {
 winRef = window.open(''+self.location,'mywin',
'width=350,height=300,toolbar=1,status=1,resizable=1,scrollbars=1')
}

function gotoLocation(location) {
	viewer.scene.camera.position = locations[location];
}

function flytoLocation(location) {
	viewer.scene.camera.flyTo({
		destination: locations[location]
	});
}

function init() {
	viewer = new Cesium.Viewer('cesiumContainer', {
			vrButton: true,
			baseLayerPicker: false,
			imageryProvider: new Cesium.BingMapsImageryProvider({
				url : '//dev.virtualearth.net',
				mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
			})
		});
	viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
			url: 'https://assets.agi.com/stk-terrain/world',
			requestVertexNormals: true
		});

	viewer.scene.globe.depthTestAgainstTerrain = true;
	
	// The camera's X-axis. When looking at the globe rotating around this axis makes the view go up and down vertically.
	var xaxis = new Cesium.Cartesian3(1, 0, 0);
	// The camera's Y-axis. When looking at the globe rotating around this axis makes the view go left and right horizontally.
	var yaxis = new Cesium.Cartesian3(0, 1, 0);
	// The camera's Z-axis. When looking at the globe rotating around this axis makes the view go left and right horizontally ???? Empirical but I don't understand why.
	var zaxis = new Cesium.Cartesian3(0, 0, 1);
	
	function rotateX(amount) {
		viewer.scene.camera.rotate(xaxis, amount);
	}
	
	function rotateY(amount) {
		viewer.scene.camera.rotate(yaxis, amount);
	}
	
	function rotateZ(amount) {
		viewer.scene.camera.rotate(zaxis, amount);
	}

	// Clone the frustum properties into our patched frustum object...
	//var patchedFrustum = viewer.scene.camera.frustum.clone(new PerspectiveFrustumPatch());
	// Patch the camera frustum prototype...
	//viewer.scene.camera.frustum = patchedFrustum;


	//cesiumVR = new CesiumVR(1000000000.0, run);

	//var patchedFrustum = viewer.scene.camera.frustum.clone(new PerspectiveFrustumPatch());
	//viewer.scene.camera.frustum = patchedFrustum;

	/* global mat4, VRCubeSea, WGLUStats, WGLUTextureLoader, VRSamplesUtil */
	(function () {
		"use strict";
		var vrDisplay = null;
		var frameData = null;

		var vrPresentButton = null;
		// ================================
		// WebVR-specific code begins here.
		// ================================
		// WebGL setup.
		var webglCanvas = viewer.canvas;
		var gl = null;

		var stats = null;
		function initWebGL(preserveDrawingBuffer) {
			// Setting preserveDrawingBuffer to true prevents the canvas from being
			// implicitly cleared when calling submitFrame or compositing the canvas
			// on the document. For the simplest form of mirroring we want to create
			// the canvas with that option enabled. Note that this may incur a
			// performance penalty, as it may imply that additional copies of the
			// canvas backbuffer need to be made. As a result, we ONLY want to set
			// that if we know the VRDisplay has an external display, which is why
			// we defer WebGL initialization until after we've gotten results back
			// from navigator.getVRDisplays and know which device we'll be
			// presenting with.

			var glAttribs = {
				alpha: false,
				preserveDrawingBuffer: preserveDrawingBuffer
			};
			gl = webglCanvas.getContext("webgl", glAttribs);
			if (!gl) {
				gl = webglCanvas.getContext("experimental-webgl", glAttribs);
				if (!gl) {
					VRSamplesUtil.addError("Your browser does not support WebGL.");
					return;
				}
			}
			gl.clearColor(0.1, 0.2, 0.3, 1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);

			stats = new WGLUStats(gl);
			// Wait until we have a WebGL context to resize and start rendering.
			window.addEventListener("resize", onResize, false);
			onResize();
			window.requestAnimationFrame(onAnimationFrame);
		}
		function onVRRequestPresent() {
			// PJR need to resize window first so that it matches the size of the HMD eyes.
			var leftEye = vrDisplay.getEyeParameters("left");
			var rightEye = vrDisplay.getEyeParameters("right");
			var hmdWidth = leftEye.renderWidth + rightEye.renderWidth;
			var hmdHeight = leftEye.renderHeight + rightEye.renderHeight;
			
			console.log("HDM is displaying " + hmdWidth + " pixels wide and " + hmdHeight + " pixels high.");
			var hmdAspectRatio = hmdWidth / hmdHeight;
			// PJR Assuming a Chrome browser here.
			var newWidth = hmdAspectRatio * window.outerHeight;
			
			console.log("Resizing window...");
			window.resizeTo(newWidth, window.outerHeight);
			
			// PJR now request presentation mode.
			vrDisplay.requestPresent([{
						source: webglCanvas
					}
				]).then(function () {}, function () {
				VRSamplesUtil.addError("requestPresent failed.", 2000);
			});
		}
		function onVRExitPresent() {
			if (!vrDisplay.isPresenting)
				return;
			vrDisplay.exitPresent().then(function () {}, function () {
				VRSamplesUtil.addError("exitPresent failed.", 2000);
			});
		}
		function onVRPresentChange() {
			onResize();
			if (vrDisplay.isPresenting) {
				if (vrDisplay.capabilities.hasExternalDisplay) {
					VRSamplesUtil.removeButton(vrPresentButton);
					vrPresentButton = VRSamplesUtil.addButton("Exit VR", "E", "media/icons/cardboard64.png", "vricon", onVRExitPresent);
				}
			} else {
				if (vrDisplay.capabilities.hasExternalDisplay) {
					VRSamplesUtil.removeButton(vrPresentButton);
					vrPresentButton = VRSamplesUtil.addButton("Enter VR", "E", "media/icons/cardboard64.png", "vricon", onVRRequestPresent);
				}
			}
		}
		if (navigator.getVRDisplays) {
			frameData = new VRFrameData();
			navigator.getVRDisplays().then(function (displays) {
				if (displays.length > 0) {
					vrDisplay = displays[0];
					vrDisplay.depthNear = 0.1;
					vrDisplay.depthFar = 1024.0;

					VRSamplesUtil.addButton("Reset Pose", "R", null, function () {
						vrDisplay.resetPose();
					});
					if (vrDisplay.capabilities.canPresent)
						vrPresentButton = VRSamplesUtil.addButton("Enter VR", "E", "media/icons/cardboard64.png", "vricon", onVRRequestPresent);
					window.addEventListener('vrdisplaypresentchange', onVRPresentChange, false);
					window.addEventListener('vrdisplayactivate', onVRRequestPresent, false);
					window.addEventListener('vrdisplaydeactivate', onVRExitPresent, false);
					// Only use preserveDrawingBuffer if we have an external display to
					// mirror to.
					initWebGL(vrDisplay.capabilities.hasExternalDisplay);
				} else {
					initWebGL(false);
					VRSamplesUtil.addInfo("WebVR supported, but no VRDisplays found.", 3000);
				}
			});
		} else if (navigator.getVRDevices) {
			initWebGL(false);
			VRSamplesUtil.addError("Your browser supports WebVR but not the latest version. See <a href='http://webvr.info'>webvr.info</a> for more info.");
		} else {
			// No VR means no mirroring, so create WebGL content without
			// preserveDrawingBuffer
			initWebGL(false);
			VRSamplesUtil.addError("Your browser does not support WebVR. See <a href='http://webvr.info'>webvr.info</a> for assistance.");
		}
		function onResize() {
			if (vrDisplay && vrDisplay.isPresenting) {
				// If we're presenting we want to use the drawing buffer size
				// recommended by the VRDevice, since that will ensure the best
				// results post-distortion.
				var leftEye = vrDisplay.getEyeParameters("left");
				var rightEye = vrDisplay.getEyeParameters("right");
				// For simplicity we're going to render both eyes at the same size,
				// even if one eye needs less resolution. You can render each eye at
				// the exact size it needs, but you'll need to adjust the viewports to
				// account for that.
				webglCanvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
				webglCanvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
			} else {
				// We only want to change the size of the canvas drawing buffer to
				// match the window dimensions when we're not presenting.
				webglCanvas.width = webglCanvas.offsetWidth * window.devicePixelRatio;
				webglCanvas.height = webglCanvas.offsetHeight * window.devicePixelRatio;
			}
		}
		function onAnimationFrame(t) {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			if (vrDisplay) {
				vrDisplay.requestAnimationFrame(onAnimationFrame);
				vrDisplay.getFrameData(frameData);
				if (vrDisplay.isPresenting) {
					var camera = viewer.scene.camera;
					
					var x = camera.position.x;
					var y = camera.position.y;
					var z = camera.position.z;
					var r = Math.sqrt(x * x + y * y + z * z);
					var h = viewer.scene.globe.getHeight(camera.positionCartographic);
					var rdiff = r - Cesium.Ellipsoid.WGS84.maximumRadius;
					//console.log("Height = " + h + " (" + x + ", " + y + ", " + z + ", r = " + r + ", rdiff = " + rdiff + ")");
			
					// The pose is your position in the room?
					//console.log(frameData.pose.position);
					// Pose orientation is where the egadset is looking?
					console.log(frameData.pose.orientation);
					
					if (rdiff < 0) {
						//viewer.camera.rotateUp(frameData.pose.orientation[0]);
						//viewer.camera.rotateRight(frameData.pose.orientation[1]);
					}
					
					if (frameData.pose && frameData.pose.orientation) {
						// Move the camera around according to your headset position i.e. the head moves will scroll the map.
						// The pose can be null if you lose tracking.
						var factor;
						
						if (h > 10000) {
							factor = 100;
						}
						if (h > 900 && h <= 10000) {
							factor = 0.01;
						}
						else {
							factor = 0.001;
						}
						
						console.log("Pitch = " + camera.pitch + ", " + frameData.pose.orientation[0] * Math.PI + ", x = " + frameData.pose.orientation[0] + ", y = " + frameData.pose.orientation[1] + ", z = " + frameData.pose.orientation[2]);
						//rotateX(-frameData.pose.orientation[0] * factor);
						//rotateY(frameData.pose.orientation[1] * factor);
						//rotateZ(frameData.pose.orientation[2] * factor);
						
						// frameData.pose.orientation[0] represents the vertical axis. 0 is straight ahead and moving up is postive. 90 degrees is half way i.e. 0.5, until
						// you go upside down back to the horizontal at 1.0. For looking down start at 0 and go negative.
						
						//camera.lookRight(camera.pitch - (-Math.PI / 2 + frameData.pose.orientation[1] * Math.PI));
						console.log("Pitch = " + camera.pitch + ", Headset pitch = " + frameData.pose.orientation[0] * Math.PI);
						var verticalAngle = -Math.PI / 2 + frameData.pose.orientation[0] * Math.PI;
						console.log("Vertical angle = " + verticalAngle);
						var horizontalAngle;
						
						if (frameData.pose.orientation[0] > 0) {
							// Looking up.
							verticalAngle = -Math.PI / 2 + frameData.pose.orientation[0] * Math.PI;
							if (verticalAngle > 0) {
								verticalAngle = 0;
							}
							
							camera.lookDown(camera.pitch - verticalAngle);
						}
						if (frameData.pose.orientation[0] < 0) {
							// Looking down.
							verticalAngle = -Math.PI / 2 - frameData.pose.orientation[0] * Math.PI;
							if (verticalAngle > 0) {
								verticalAngle = 0;
							}
							
							camera.lookUp(camera.pitch - verticalAngle);
						}
						
						/* console.log("Roll = " + camera.direction + ", Headset roll = " + frameData.pose.orientation[1] * Math.PI);
						if (frameData.pose.orientation[1] > 0) {
							// Looking up.
							horizontalAngle = -Math.PI / 2 + frameData.pose.orientation[0] * Math.PI;
							if (horizontalAngle > 0) {
								horizontalAngle = 0;
							}
							
							camera.lookRight(camera.roll - horizontalAngle);
						}
						if (frameData.pose.orientation[1] < 0) {
							// Looking down.
							horizontalAngle = -Math.PI / 2 - frameData.pose.orientation[0] * Math.PI;
							if (horizontalAngle > 0) {
								horizontalAngle = 0;
							}
							
							camera.lookLeft(camera.roll - horizontalAngle);
						} */
					}
		
					// Render the Cesium scene.
					viewer.render();
					// Send the image to the VR headset.
					vrDisplay.submitFrame();
				} else {
					gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);
					viewer.render();

					//stats.renderOrtho();
				}
			} else {
				window.requestAnimationFrame(onAnimationFrame);
				// No VRDisplay found.
				gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);

				viewer.render();
				//stats.renderOrtho();
			}
		}
	})();
};