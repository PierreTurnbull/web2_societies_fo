import React, { Component } from 'react'
import * as THREE from 'three';
import { vertexShader, fragmentShader, setRandomShader } from './shaders';
import { throttle, debounce } from 'lodash';
import scrollSpeed from 'utils/scrollSpeed';
import { TweenLite } from "gsap/TweenMax";
import { SpriteText2D, textAlign } from 'three-text2d'
import scrollImage from "images/scroll.png"

THREE.ImageUtils.crossOrigin = '';
let camera;
export default class FullScreen extends Component {

    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        this.loader = new THREE.TextureLoader()
        this.images = this.props.images;
        this.scrollImage = this.loader.load(scrollImage);

        this.loadImages = () => {
            const arr = [];
            arr.push(...this.images.map((image) => {
                return this.loader.load(image);
            }));
            this.images = arr;
        }

        // setTimeout(() => {
        //     this.nb = 1;
        //     this.MyTexture = this.loader.load(this.img);
        //     this.uniforms.texture = { type: "sampler2D", value: this.MyTexture };
        // }, 1000)

        this.imageWidth = window.innerWidth;
        this.imageHeight = window.innerHeight;

        this.uniforms = {
            time: { type: "f", value: 1.0 },
            random: { type: "f", value: this.random },
            resolution: { type: "v2", value: new THREE.Vector2(this.imageWidth, this.imageHeight) },
            uvRate1: { type: "f", value: new THREE.Vector2(1, 1) },
            userScrollSpeed: { type: "f", value: this.userScrollSpeed }
        };

        this.uniforms2 = {
            time: { type: "f", value: 1.0 },
            random: { type: "f", value: this.random },
            resolution: { type: "v2", value: new THREE.Vector2(this.imageWidth, this.imageHeight) },
            uvRate1: { type: "f", value: new THREE.Vector2(1, 1) },
            userScrollSpeed: { type: "f", value: this.userScrollSpeed }
        };

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            // wireframe: true
        });

        this.material2 = new THREE.ShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blendSrc: THREE.SrcAlphaFactor,
            transparent: true,
            combine: THREE.MixOperation,
            blending: THREE.AdditiveBlending,
            // wireframe: true
        });
    }

    componentDidMount() {
        this.loadImages();
        this.init();
        this.animate();
    }
    componentWillUnmount() {
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }

    componentDidUpdate() {
        this.MyTexture = this.images[this.props.imageIndex];
        this.MyTexture2 = this.images[this.props.imageIndex + 1];
        this.MyMap = this.images[this.props.imageIndex];

        this.uniforms.map = { type: "sampler2D", value: this.MyMap };
        this.uniforms.texture = { type: "sampler2D", value: this.MyTexture, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping };
        this.uniforms.texture2 = { type: "sampler2D", value: this.MyTexture2 };

        // this.uniforms2.texture = { type: "sampler2D", value: this.loader.load("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNJFxWUrjTsaM7yXmwYT8PSa9hNyRyMiR7NhJgu6ismDykbpbH") };
        // this.MyTexture = this.images[this.props.imageIndex];
        // this.MyTexture2 = this.images[this.props.imageIndex];
        // this.uniforms.texture = { type: "sampler2D", value: this.MyTexture, wrapS: THREE.MirroredRepeatWrapping, wrapT: THREE.MirroredRepeatWrapping };
        // this.uniforms.texture2 = { type: "sampler2D", value: this.MyTexture2 };
    }

    init() {
        camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.01, 1000);
        camera.position.z = 1;

        this.scene = new THREE.Scene();
        this.geometry = new THREE.PlaneGeometry(
            1,
            1,
            20,
            20
        );

        this.geometry.verticesNeedUpdate = true;
        this.MyTexture = this.images[this.props.imageIndex];
        this.MyTexture2 = this.images[this.props.imageIndex + 1];
        this.MyTransitionMap = this.loader.load(this.props.transitionMap);
        this.MyMap = this.images[this.props.imageIndex];


        this.uniforms2.texture = { type: "sampler2D", value: this.scrollImage, wrapS: THREE.MirroredRepeatWrapping, transparent: true };
        this.uniforms2.texture.transparent = true;

        this.uniforms.texture = { type: "sampler2D", value: this.MyTexture, wrapS: THREE.MirroredRepeatWrapping };
        this.uniforms.texture2 = { type: "sampler2D", value: this.MyTexture2 };
        this.uniforms.map = { type: "sampler2D", value: this.MyMap };
        this.uniforms.transitionMap = { type: "sampler2D", value: this.MyTransitionMap };
        this.uniforms.progress = { type: "sampler2D", value: this.props.progress };
        this.uniforms.scrollProgress = { type: "sampler2D", value: this.props.scrollProgress };

        let setSpeed = throttle((speed) => {
            TweenLite.to(this.uniforms.userScrollSpeed, 1, { value: speed * 5 })
        }, 10);

        let setBack = debounce(() => {
            TweenLite.to(this.uniforms.userScrollSpeed, 1, { value: 0 })
        }, 0);

        window.onscroll = () => {
            const speed = scrollSpeed();
            setSpeed(speed / 200);
            setBack();
        };

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.textMesh = new THREE.Mesh(this.geometry, this.material2);
        this.text = new SpriteText2D("Hello world!", { font: '30px Arial', fillStyle: '#000000', antialias: true })
        console.log(this.text);
        
        this.scene.add(this.text)
        this.scene.add(this.mesh, this.textMesh);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setClearColor(0xff0000, 1);
        this.canvas.appendChild(this.renderer.domElement);

        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize, false);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.uniforms.time.value += 0.03;
        this.uniforms2.time.value += 0.04;
        this.uniforms.progress.value = this.props.progress;
        this.uniforms.scrollProgress.value = this.props.scrollProgress;
        this.textMesh.position.y = -this.textMesh.scale.y;
        
        this.renderer.render(this.scene, camera);
    }

    onWindowResize(event) {
        let w = this.canvas.clientWidth;
        let h = this.canvas.clientHeight;
        const canvasRation = this.canvas.clientWidth / this.canvas.clientHeight;
        camera.aspect = canvasRation;

        let dist = camera.position.z - this.mesh.position.z;
        let height = 1;
        camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

        let sceneW = this.canvas.clientWidth;
        let sceneH = this.canvas.clientHeight;

        this.renderer.setSize(w, h);
        this.material.uniforms.uvRate1.value.y = canvasRation;

        this.mesh.scale.x = sceneW / sceneH;
        this.mesh.scale.y = this.mesh.scale.x * sceneH / sceneW;

        this.textMesh.scale.x = .5;
        this.textMesh.scale.y = .5 / 2;

        camera.updateProjectionMatrix();

    }

    render() {
        return (
            <div className={this.props.className} ref={(ref) => this.canvas = ref}>
            </div>
        )
    }
}