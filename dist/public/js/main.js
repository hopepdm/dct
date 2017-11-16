/**
 * Created by pdm on 2017/11/6.
 */
/**
 * 修改页面展示及控制面板
 *
 */
var scene,
    camera,
    cameraDistance = 3,
    objScele,
    renderer,
    android,
    geometrys,
    singleObj,
    dragRotateControls,

    //光源参数
    ambientLight,
    lightColor,
    lightIntensity,
    intensity,
    light1,
    light2,
    light3,
    light4,
    light5,
    light6,

    //面板参数
    roamBoolean = false,
    backGroundColor,
    controls,
    cameraPosition;

function initScene(obj) {
    var backObj = document.querySelector('.back');
  backObj.addEventListener('touchstart', function (event){
      window.history.back(); //可以换成http地址
  }, false);

  backObj.addEventListener('click', function (event){
      window.history.back(); //可以换成http地址
  }, false);
  
    singleObj = obj;
    var modelPath = singleObj.objurl;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, singleObj.near, singleObj.far);
    //camera.position.set(0, 0, 0.1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //camera.up.set(0, 1, 0);
    scene.add(camera);

    //读取 .obj文物模型
    var manager = new THREE.LoadingManager();

    var arrs = modelPath.split(".");
    if (arrs[1] == "js") {
        var binaryLoader = new THREE.BinaryLoader(manager);
        binaryLoader.setCrossOrigin('');
        binaryLoader.load(modelPath, addModelToScene);

    } else if (arrs[1] == "obj") {
        var s = arrs[0].lastIndexOf('/');
        var basePath = arrs[0].substring(0, s + 1);
        var modelName = arrs[0].substring(s + 1);

        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setCrossOrigin('');
        mtlLoader.setPath(basePath);

        mtlLoader.load(modelName + '.mtl', function(materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader(manager);
            objLoader.setMaterials(materials);
            objLoader.setPath(basePath);

            objLoader.load(modelName + '.obj', function(object) {
                android = object;

                android.rotation.x = singleObj.modelRotation.x || 0;
                android.rotation.y = singleObj.modelRotation.y || 0;
                android.rotation.z = singleObj.modelRotation.z || 0;
                android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

                scene.add(android);

                adjustSceneParam();

                // 辅助线
                // var helperGrid = new THREE.GridHelper( 1,0.2, 0xFF0000, 0xFFFFFF );
                // helperGrid.position.set(0, -1, 0);
                // scene.add( helperGrid );

                // var arrowHelper = new THREE.AxisHelper(1);
                // scene.add( arrowHelper );
                //

                onWindowResize();
				
				for (var i = 0; i < android.children.length; i++) {
					if (android.children[i].material.type == 'MultiMaterial') {
						for (var j = 0; j < android.children[i].material.materials.length; j++) {
							android.children[i].material.materials[j].transparent = true;
							android.children[i].material.materials[j].color.setHex(singleObj.isMaterialColor);
							android.children[i].material.materials[j].specular.setHex(singleObj.isSpecularColor);
							android.children[i].material.materials[j].shininess = singleObj.isMaterialShininess;
							android.children[i].material.materials[j].opacity = singleObj.isMaterialOpacity;
						}
					} else {
						android.children[i].material.transparent = true;
						android.children[i].material.color.setHex(singleObj.isMaterialColor);
						android.children[i].material.specular.setHex(singleObj.isSpecularColor);
						android.children[i].material.shininess = singleObj.isMaterialShininess;
						android.children[i].material.opacity = singleObj.isMaterialOpacity;
						
					}
				}
				
				for (var i = 0; i < android.children.length; i++) {
					if (android.children[i].material.type == 'MultiMaterial') {
						for (var j = 0; j < android.children[i].material.materials.length; j++) {
							android.children[i].material.materials[j].wireframe = singleObj.wireFrame;
							if (android.children[i].material.materials[j].wireframe) {
								android.children[i].material.materials[j].emissive.setHex(0xFFFFFF);
							} else {
								android.children[i].material.materials[j].emissive.setHex(0x000000);
							}
						}
					} else {
						android.children[i].material.wireframe = singleObj.wireFrame;
						if (android.children[i].material.wireframe) {
							android.children[i].material.emissive.setHex(0xFFFFFF);
						} else {
							android.children[i].material.emissive.setHex(0x000000);
						}
					}
				}

            }, onProgress);

        }); // mtlLoader end
    } // if else end

    var onProgress = function(xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      // console.log(percentComplete);

      $("#bar")[0].style.width = Math.round(percentComplete, 2) + "%";
      $("#bar").html(Math.round(percentComplete, 2) + "%");
      if (Math.round(percentComplete, 2) == 100) {
        $("#loaderdiv").hide();
      }
    }
  }//onProgress end



    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(singleObj.bgColor, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // console.log(scene);
	container = document.querySelector('#ThreeJS')
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    animate();

} // initScene end

function addModelToScene(geometry, materials) {
    var material = new THREE.MultiMaterial(materials);
    android = new THREE.Mesh(geometry, material);

    android.rotation.x = singleObj.modelRotation.x || 0;
    android.rotation.y = singleObj.modelRotation.y || 0;
    android.rotation.z = singleObj.modelRotation.z || 0;
    android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

    scene.add(android);

    //geometrys = geometry;
    //geometrys.computeBoundingBox();
    adjustSceneParam();
    onWindowResize();
} // addModelToScene end

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    dragRotateControls = new THREE.DragRotateControls(camera, android, renderer.domElement);

} // onWindowResize end

function adjustSceneParam() {
    var box3 = new THREE.Box3().setFromObject(android);
    var size = box3.size();

    var width = size.x;
    var height = (window.innerHeight / window.innerWidth) * width;
    if (height < size.y) {
        height = size.y;
        width = (window.innerWidth / window.innerHeight) * height;
    }
    var hw = height > width ? height : width;
    objScele = hw / 70;
    cameraDistance = 1.3 * hw;

    camera.position.set(0, 0, cameraDistance);

    // 光源
    if (singleObj.ambient) {
        ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);
    }

    lightColor = singleObj.lightSet[0].color;
    lightIntensity = singleObj.lightSet[0].intensity;

    light1 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light1.position.set(0, 0, cameraDistance / 2);
    light1.target = android;
    // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // scene.add(h1)
    scene.add(light1);

    light2 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light2.position.set(0, 0, -cameraDistance);
    light2.target = android;
    scene.add(light2);

    light3 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light3.position.set(0, cameraDistance, 0);
    light3.target = android;
    scene.add(light3);

    light4 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light4.position.set(0, -cameraDistance, 0);
    light4.target = android;
    scene.add(light4);

    light5 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light5.position.set(cameraDistance, 0, 0);
    light5.target = android;
    scene.add(light5);

    light6 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light6.position.set(-cameraDistance, 0, 0);
    light6.target = android;

    scene.add(light6);


} // adjustSceneParam end

function animate() {
    renderer.render(scene, camera);
    if (roamBoolean) {
        android.rotation.x += 0.01;
        android.rotation.y += 0.02;
    }

    if (dragRotateControls) dragRotateControls.update();
    requestAnimationFrame(animate);


}
