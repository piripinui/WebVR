var viewer,
cesiumVR,
globalFo=6371172.35,
//globalFocalLength = -160000000;
globalFocalLength = -5000000,
projNear = 1, projFar = 500000000,
eyeSeperationDenominator = 20,
lastGoodHeight,
locations = {
	denver: new Cesium.Cartesian3(-1272209.292469148, -4751630.941108344, 4063428.939909443),
	redrocks: new Cesium.Cartesian3(-1289792.3587257643, -4746245.525598164, 4051013.2689858945)
},
vrGamepads = [];;

function newWindowRetest() {
 winRef = window.open(''+self.location,'mywin',
'width=350,height=300,toolbar=1,status=1,resizable=1,scrollbars=1')
}

function gotoLocation(location) {
	viewer.scene.camera.position = locations[location];
}

function flytoLocation(location) {
	viewer.scene.camera.flyTo({
		destination: locations[location],
		orientation: {
			pitch: 0.0
		}
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
	
	var camera = viewer.scene.camera;
	var lastLeftRight, lastUpDown;
	
	// The camera's X-axis. When looking at the globe rotating around this axis makes the view go up and down vertically. That is, x points in the local east direction.
	var xaxis = new Cesium.Cartesian3(camera.position.x, 0, 0);
	// The camera's Y-axis. When looking at the globe rotating around this axis makes the view go left and right horizontally. That is, y points in the local north direction.
	var yaxis = new Cesium.Cartesian3(0, camera.position.y, 0);
	// The camera's Z-axis. When looking at the globe rotating around this axis makes the view go left and right horizontally. That is, z points in the direction of the ellipsoid surface normal which passes through the position.
	// See Transforms.eastNorthUpToFixedFrame(), which is the method used by Camera.look().
	var zaxis = new Cesium.Cartesian3(0, 0, camera.position.z);
	
	function rotateX(amount) {
		viewer.scene.camera.rotate(xaxis, amount);
	}
	
	function rotateY(amount) {
		viewer.scene.camera.rotate(yaxis, amount);
	}
	
	function rotateZ(amount) {
		viewer.scene.camera.rotate(zaxis, amount);
	}
	
	function rad2deg(rad) {
		return rad * (180 / Math.PI);
	}
	
	var headingAdjust, pitchAdjust, rollAdjust;

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
		function getVRGamepads(poseOptional) {
			var gamepads = navigator.getGamepads();
			for (var i=0; i<gamepads.length; i++) {
				var gamepad = gamepads[i];
				if (gamepad && gamepad.id == 'OpenVR Gamepad' && (gamepad.pose || poseOptional)) {
					console.log("Got a controller..." + gamepad);
					vrGamepads.push(gamepad);
				}
			}
			return vrGamepads;
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
				]).then(function () {
					getVRGamepads();
				}, function () {
				VRSamplesUtil.addError("requestPresent failed.", 2000);
			});
			
								
			
			camera.flyHome();
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
		
		function horizontalDirectionAngle() {
			var xdelta = camera.position.x - camera.direction.x;
			var ydelta = camera.position.y - camera.direction.y;
			var d = Math.sqrt(xdelta * xdelta + ydelta * ydelta);
			var directionAngle = Math.asin(Math.abs(ydelta) / d);
			
			console.log("Direction angle = " + directionAngle + " (" + rad2deg(directionAngle) + " degrees), " + xdelta + ", " + ydelta + ", " + camera.position.x + ", " + camera.direction.x);
			
			return directionAngle;
		}
			
		function onAnimationFrame(t) {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			if (vrDisplay) {
				vrDisplay.requestAnimationFrame(onAnimationFrame);
				vrDisplay.getFrameData(frameData);
				if (vrDisplay.isPresenting) {
					var camera = viewer.scene.camera;
					
					if (frameData.pose && frameData.pose.orientation) {
						// Move the camera around according to your headset position i.e. the head moves will scroll the map.
						// The pose can be null if you lose tracking.
						
						function calculateAngle(index) {
							var angle;
						
							if (frameData.pose.orientation[index] <= -0.5 && frameData.pose.orientation[index] >= -1) {
								// SW quadrant. -0.5 = PI, -1 = 3/2 PI.
								angle = Math.PI / 2 - (frameData.pose.orientation[index] * Math.PI);
							}
							if (frameData.pose.orientation[index] > 0.5 && frameData.pose.orientation[index] <= 1.0) {
								// NW quadrant. 0.5 = 2PI, 1 = 3/2PI.
								angle = 5/2 * Math.PI - (frameData.pose.orientation[index] * Math.PI);
							}
							if (frameData.pose.orientation[index] > 0.0 && frameData.pose.orientation[index] <= 0.5) {
								// NE quadrant. 0 = PI/2, 0.5 = 0.
								angle = Math.PI / 2 - (frameData.pose.orientation[index] * Math.PI);
							}
							if (frameData.pose.orientation[index] < 0.0 && frameData.pose.orientation[index] >= -0.5) {
								// SE quadrant. 0 = PI/2, -0.5 = PI.
								angle = Math.PI / 2 - (frameData.pose.orientation[index] * Math.PI);
							}
							
							return angle;
						}
						
						var hmdPitch = calculateAngle(0);
						var hmdHeading = calculateAngle(1);
						var hmdRoll = calculateAngle(2);
						
						
						if (!lastLeftRight) {
							lastLeftRight = hmdHeading;
						}
						if (!lastUpDown) {
							lastUpDown = hmdPitch;
						}

						if (!pitchAdjust) {
							pitchAdjust = camera.pitch - hmdPitch;
						}
							
						
						if (!isNaN(hmdHeading) && !isNaN(hmdPitch) && !isNaN(hmdRoll)) {
							//console.log("Heading = " + rad2deg(hmdHeading) + ", Camera heading= " + rad2deg(camera.heading));

							var hdiff = hmdHeading - lastLeftRight;
							var vdiff = hmdPitch - lastUpDown;
						
							camera.lookRight(hdiff);
							camera.lookDown(vdiff);
							
							lastUpDown = hmdPitch;
							lastLeftRight = hmdHeading;
						}
						
						//console.log("Headset = " + frameData.pose.orientation[1] + ", camera direction = " + ang + ", (" + rad2deg(ang) + "), headset angle = " + horizontalAngle + " (" + rad2deg(horizontalAngle) + "), " + hmdRoll);


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