import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ChatComponent from "../chat-component";
import { useSearchParams } from "next/navigation";
const Mum = (props: any) => {
  const containerRef = useRef(null);
  const { isShowList } = props;
  const searchParams = useSearchParams();
  const lang = searchParams?.get("lang") || "zh-CN";

  const api: any = { state: "AngryPoint" };
  let container,
    stats: any,
    clock: any,
    gui,
    mixer: any,
    actions: any,
    activeAction: any,
    previousAction;
  let camera: any,
    scene: any,
    renderer: any,
    model,
    face,
    expressionFolder: any;

  const initScene = () => {
    if (renderer) {
      return;
    }
    container = containerRef.current;
    const hightWidghtSet = isShowList
      ? 240 / 300
      : window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, hightWidghtSet, 0.25, 1000);
    // camera.position.set(10, 50, 300);
    // camera.position.set(10, 50, 100);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 2, 0);
    // camera.lookAt(0, 90, 0);

    scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load("/20240527-093724.jpeg");

    scene.background = backgroundTexture;
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);
    clock = new THREE.Clock();
    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;

    const loader = new GLTFLoader();
    loader.load(
      "/models/mum4.glb",
      (gltf) => {
        const mesh: any = gltf.scene.children[0];
        if (mesh.children[0].isMesh) {
          // mesh.children[0].material!.metalness = 0.5;
        }
        model = gltf.scene;
        scene.add(model);
        createGUI(model, gltf.animations);
      },
      undefined,
      (e) => {
        console.error(e);
      }
    );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    if (isShowList) {
      renderer.setSize(240, 300);
    } else {
      renderer.setSize(window.innerWidth, window.innerHeight);
      stats = new Stats();
      container && (container as any).appendChild(stats.dom);
    }

    container && (container as any).appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize);
  };

  const createGUI = (model: any, animations: string | any[]) => {
    const states = [
      "Acknowledge",
      "AngryPoint",
      "breakdance",
      "excited",
      "headNodeYes",
      "shakingHead",
    ];
    mixer = new THREE.AnimationMixer(model);
    actions = {};
    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i];
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
    }
    if (!isShowList) {
      gui = new GUI();
      const statesFolder = gui.addFolder("States");
      const clipCtrl = statesFolder.add(api, "state").options(states);

      clipCtrl.onChange(() => {
        fadeToAction(api.state, 0.5);
      });

      statesFolder.open();
      gui.close();
    }
    // setGUI(gui);

    // setActions(actions); // --

    // const emoteFolder = gui.addFolder("Emotes");

    // const createEmoteCallback = (name: any) => {
    //   api[name] = () => {
    //     fadeToAction(name, 0.2);
    //     mixer.addEventListener("finished", restoreState);
    //   };

    //   emoteFolder.add(api, name);
    // };

    const restoreState = () => {
      mixer.removeEventListener("finished", restoreState);
      fadeToAction(api.state, 0.2);
    };

    // emoteFolder.open();
    // face = model.getObjectByName("Head_4");

    // const expressions = Object.keys(face.morphTargetDictionary);

    // expressionFolder = gui.addFolder("Expressions");

    // for (let i = 0; i < expressions.length; i++) {
    //   expressionFolder
    //     .add(face.morphTargetInfluences, i.toString(), 0, 1, 0.01)
    //     .name(expressions[i]);
    // }
    activeAction = actions["AngryPoint"];
    activeAction.play();
    // expressionFolder.open();
  };

  const fadeToAction = (name: string, duration: number) => {
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {
      previousAction.fadeOut(duration);
    }
    activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
  };

  const onWindowResize = () => {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const animate = () => {
    if (!renderer) {
      return;
    }
    const dt = clock.getDelta();

    if (mixer) mixer.update(dt);

    requestAnimationFrame(animate);

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    if (stats) {
      stats.update();
    }
  };
  const actionFade = (e: any) => {
    fadeToAction(e.detail.name, 0.5);
    return;
  };
  const actionFolder = (e: any) => {
    if (!e.detail.isZero) {
      const keys = Object.keys(
        expressionFolder.controllers[e.detail.key].object
      );
      keys.forEach((item) => {
        expressionFolder.controllers[e.detail.key].object[item] =
          e.detail.value;
      });
    } else {
      const controllerKeys = Object.keys(expressionFolder.controllers);
      controllerKeys.forEach((itemController) => {
        const keys = Object.keys(
          expressionFolder.controllers[itemController].object
        );
        keys.forEach((item) => {
          expressionFolder.controllers[itemController].object[item] = 0;
        });
      });
    }
    return;
  };

  useEffect(() => {
    initScene();
    animate();
    window.addEventListener("fadeToAction", actionFade);
    // window.addEventListener("expressionFolder", actionFolder);
    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("fadeToAction", actionFade);
      // window.removeEventListener("expressionFolder", actionFolder);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} />
      {!isShowList && (
        <div className="chat-component">
          <ChatComponent
            gameId="mum"
            fadeToAction={fadeToAction}
            expressionFolder={expressionFolder}
            voiceId={lang === "en" ? "v2/en_speaker_9" : "v2/zh_speaker_6"}
          />
        </div>
      )}
    </>
  );
};

export default Mum;
