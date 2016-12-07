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
	redrocks: new Cesium.Cartesian3(-1289792.3587257643, -4746245.525598164, 4051013.2689858945),
	controller: Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 0.0)
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
	
	var span = document.createElement('span');
	span.style.position = 'absolute';
	span.style.top = '10px';
	span.style.left = '10px';
	span.style.color = "white";
	span.style["font-family"] = "Courier New";
	span.style["z-index"] = '999';
	span.textContent = "Debug";
	viewer.container.appendChild(span);
	
	var camera = viewer.scene.camera;
	var viveControllerModel;
	var lastLeftRight, lastUpDown;
		
	function rad2deg(rad) {
		return rad * (180 / Math.PI);
	}
	
	function pad(num, size) {
		var s = num+"";
		while (s.length < size) s = "0" + s;
		return s;
	}
	
	function flyHome() {
		console.log("Flying back to home position...");
		camera.flyHome();
	}
	
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
					//console.log("Got a controller..." + gamepad);
					
					if (gamepad.pose.position) {
						var cartPos = camera.positionCartographic;
						var newPos = Cesium.Cartesian3.fromDegrees(rad2deg(cartPos.longitude), rad2deg(cartPos.latitude), cartPos.height - 10);
						var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(newPos);
						
						// Load the Vive controller model.
						if (!viveControllerModel) {
							console.log("Loading the Vive controller model...");
		
							
							viveControllerModel = viewer.scene.primitives.add(Cesium.Model.fromGltf({
								url : 'models/Vive_Controller_Body.glb',
								modelMatrix : modelMatrix,
								scale : 1.0
							}));
						}
						else {
							// Change the existing model's position.
							
						}
						
						/* camera.flyTo({
							destination: newPos
						}); */
					}
					
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
			
			camera.flyHome();
			
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

					VRSamplesUtil.addButton("Fly to Home", "F", null, null, flyHome);
					VRSamplesUtil.addButton("Fly to Redrocks", "D", null, null, function () {
						flytoLocation('redrocks');
					});
					VRSamplesUtil.addButton("Reset Pose", "R", null, null, function () {
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
						var hmdRoll = calculateAngle(2) - Math.PI / 2;
						
						if (hmdRoll < 0) {
							// Ensure angles are between 0 and 360 degrees.
							hmdRoll = Math.PI * 2 + hmdRoll;
						}
						
						
						if (!lastLeftRight) {
							lastLeftRight = hmdHeading;
						}
						if (!lastUpDown) {
							lastUpDown = hmdPitch;
						}
												
						if (!isNaN(hmdHeading) && !isNaN(hmdPitch) && !isNaN(hmdRoll)) {
							//console.log("Heading = " + rad2deg(hmdHeading) + ", HMD pitch = " + rad2deg(hmdPitch) + ", HMD roll = " + rad2deg(hmdRoll) + ", " + frameData.pose.orientation[2]);

							var hdiff = hmdHeading - lastLeftRight;
							var vdiff = hmdPitch - lastUpDown;
						
							camera.lookRight(hdiff);
							camera.lookDown(vdiff);
							

							camera.setView({
								orientation: {
									heading: hmdHeading,
									pitch: Math.PI / 2 - hmdPitch,
									roll: hmdRoll
								}
							});
							
							lastUpDown = hmdPitch;
							lastLeftRight = hmdHeading;
							span.textContent = "HMD Heading = " + pad(rad2deg(hmdHeading).toFixed(2), 6) + ", Camera heading= " + pad(rad2deg(camera.heading).toFixed(2), 6) 
												+ ", HMD pitch = " + pad(rad2deg(hmdPitch).toFixed(2), 6) + ", Camera pitch = " + pad(rad2deg(camera.pitch).toFixed(2), 6)
												+ ", HMD roll = " + pad(rad2deg(hmdRoll).toFixed(2), 6) + ", Camera roll = " + pad(rad2deg(camera.roll).toFixed(2), 6);
						}
					}
					
					vrGamepads = [];
					getVRGamepads();
					
					if (vrGamepads) {
					    if (vrGamepads[0]) {
							//console.log(vrGamepads[0].pose.position);
						}
						if (vrGamepads[1]) {
							//console.log(vrGamepads[1].pose.position + vrGamepads[1].pose.orientation);
						}
					}
		
					// Render the Cesium scene.
					viewer.render();
					// Send the image to the VR headset.
					vrDisplay.submitFrame();
				} else {
					var camera = viewer.scene.camera;
					gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);
					span.textContent = "Camera heading = " + pad(rad2deg(camera.heading).toFixed(2), 6) 
									+ ", Camera pitch = " + pad(rad2deg(camera.pitch).toFixed(2), 6)
									+ ", Camera roll = " + pad(rad2deg(camera.roll).toFixed(2), 6);
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
		
		var makeGamepadTracker = function (scene, gamepadIndex, buttonHandler) {
			
			var trk = function (drawable, timePoint) {
				// console.log('hi!');
				var vrGamepads = getVRGamepads();
				// console.log('Got ', vrGamepads.length, 'VR gamepads from ', gamepads.length, 'total gamepads');
				if (vrGamepads.length && vrGamepads[gamepadIndex]) {
					var myGp = vrGamepads[gamepadIndex];
					var gPose = myGp.pose;
					if (!(gPose && gPose.orientation && gPose.position)) return; /* Pose is missing or incomplete, not much we can do! */
					var gpMat = mat4.create();
					// var orientation = gPose.orientation;
					// var position = gPose.
					if (window.vrDisplay.stageParameters) {
						mat4.fromRotationTranslation(gpMat, gPose.orientation, gPose.position);
						mat4.multiply(gpMat, vrDisplay.stageParameters.sittingToStandingTransform, gpMat);
						
						var ploc = scene.playerLocation;
						var trans = vec3.fromValues(ploc.x, ploc.y, ploc.z);
						var reloc = mat4.create();
						mat4.fromTranslation(reloc, trans);
						mat4.mul(gpMat, reloc, gpMat);
						
					}
					for (var btnIdx=0; btnIdx<myGp.buttons.length; btnIdx++) {
						var scratchPadKey = 'Button' + btnIdx + 'Down';
						var prevState = drawable.scratchPad[scratchPadKey] || false;
						var myButton = myGp.buttons[btnIdx];
						var buttonStatus = (myButton.pressed ? 'down' : 'up');
						if (myButton.pressed != prevState) {
							// console.debug(myGp);
							buttonStatus = (myButton.pressed ? 'pressed' : 'released')
							drawable.scratchPad[scratchPadKey] = myButton.pressed;
							// console.log('Button ', btnIdx, buttonStatus, 'on gamepad', gamepadIndex);
						}
						else if (myButton.pressed) {
							buttonStatus = 'held';
							// console.log('Button ', btnIdx, buttonStatus, 'on gamepad', gamepadIndex);
						}
						
						drawable.scratchPad['trackpadAxes'] = myGp.axes;
						if (btnIdx == 0 && myButton.touched) {
							var sector;
							// var a = myGp.axes[0]<0,
							//     b = myGp.axes[0]>0,
							//     c = myGp.axes[1]<0,
							//     d = myGp.axes[1]>0;
							var a = -0.5 < myGp.axes[0] < 0.5, 
								b = myGp.axes[0] < -0.5 || myGp.axes[0] > 0.5, 
								c = -0.5 < myGp.axes[1] < 0.5, 
								d = myGp.axes[1] < -0.5 || myGp.axes[1] > 0.5;
							if (!a && !b && !c && !d) {
								sector = 'center';
							}
							else if (!a && !b && c && d) {
								sector = 's';
							}
							else if (a && b && c && d) {
								sector = 'sw';
							}
							else if (a && b && !c && !d) {
								sector = 'w';
							}
							else if (a && b && !c && d) {
								sector = 'nw';
							}
							else if (!a && !b && !c && d) {
								sector = 'n';
							}
							else if (!a && b && !c && d) {
								sector = 'ne';
							}
							else if (!a && b && !c && !d) {
								sector = 'e';
							}
							else if (!a && b && c && d) {
								sector = 'se';
							}
							drawable.scratchPad['trackpadSector'] = sector;
							// console.log(sector);
						}
						
						if (buttonHandler) {
							var extra = {drawable: drawable, gamepad: myGp, sector: sector, buttonRaw: myButton};
							buttonHandler(gamepadIndex, btnIdx, buttonStatus, sector, myButton, extra);
						}
						
					}
					// drawable.pos = {x:gPose.position[0], y:gPose.position[1], z:gPose.position[2]};
					// drawable.orientation = {x:gPose.orientation[0], y:gPose.orientation[1], z:gPose.orientation[2]};
					if (drawable.rotation || drawable.translation) {
						// console.log(drawable.orientation);
						// var finalMatrix = mat4.create(finalMatrix);
						var ori = drawable.rotation || {x:0, y:0, z:0};
						var tra = drawable.translation || {x:0, y:0, z:0};
						// var finalMatrix = mat4.create();
						// mat4.copy(finalMatrix, gpMat);
						// mat4.rotateX(finalMatrix, finalMatrix, ori.x);
						// mat4.rotateY(finalMatrix, finalMatrix, ori.y);
						// mat4.rotateZ(finalMatrix, finalMatrix, ori.z);
						// drawable.matrix = finalMatrix;
						
						var transmat = mat4.create();
						var finalmat = mat4.create();
						var rot = quat.create();
						quat.rotateX(rot, rot, ori.x);
						quat.rotateY(rot, rot, ori.y);
						quat.rotateZ(rot, rot, ori.z);
						var trl = vec3.fromValues(tra.x, tra.y, tra.z);
						mat4.fromRotationTranslation(transmat, rot, trl);
						mat4.mul(finalmat, gpMat, transmat);
						drawable.matrix = finalmat;
					}
						
					//     mat4.mul(finalMatrix, gpMat, drawable.orientation);
					//     drawable.matrix = finalMatrix;
					//
					// }
					else {
						drawable.matrix = gpMat;
						
					}
				}
			}
			return trk;
			
		}
	})();
};