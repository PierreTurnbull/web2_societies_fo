import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { TweenMax, TweenLite, Expo } from "gsap/TweenMax";
import { throttle, debounce } from 'lodash';

import FullScreen from '../../molecules/fullScreen/FullScreen';

import Image1 from "images/1.jpg"
import Image2 from "images/2.jpeg"
import Image3 from "images/3.jpeg"
import Image4 from "images/4.png"
import Image5 from "images/5.jpeg"
import TransitionMap from "images/transtionMap.jpg"
import JarawaImage from "images/assets/jarawa_fullscreen.jpg"
import MonksImage from "images/assets/monks_fullscreen.jpg"
import RastaImage from "images/assets/rastaa_fullscreen.jpg"
import MainUi from '../../molecules/mainUi/MainUi';
import CursorContainer from '../../atomes/cursor/CursorContainer';
import { withCursorContext } from '../../../contexts/cursor/cursor.context';
import { compose } from 'recompose';

export class Home extends React.PureComponent {
    constructor(props) {
        super(props);

        this.societiesGradient = [
            {
                r: 87, g: 18, b: 0
            },
            {
                r: 146, g: 154, b: 63
            },
            {
                r: 63, g: 154, b: 146
            },
        ]

        this.state = {
            redirect: false,
            imageIndex: 0,
            isTicking: false,
            scrollProgress: 0.0,
            gradientRGB: {
                r: this.societiesGradient[0].r,
                g: this.societiesGradient[0].g,
                b: this.societiesGradient[0].b,
            }
        }

        this.onWheel = this.onWheel.bind(this);
        this.setBack = this.setBack.bind(this);

        // this.images = [Image1, Image2, Image3, Image4, Image5, JarawaImage, MonksImage, RastaImage];
        this.images = [MonksImage, JarawaImage, RastaImage];
        this.projects = [
            {
                name: "monks",
                intro: "Les moines du Mont Athos",
                description: "Découvrez cette communauté de chrétiens orthodoxes vivant en autarcie afin de pouvoir dédier leur vie à la religion, loin de tout péchés.",
            },
            {
                name: "jarawa",
                intro: "Les Jarawas des Andaman",
                description: "Découvrez ce peuple autochtone vivant depuis des années coupé du monde moderne et du progrès technologique.",
            },
            {
                name: "rasta",
                intro: "Les rastas de Jamaïque",
                description: "Découvrez cette communauté de jamaïcains vivant en autarcie selon des principes et une religion qui leurs sont propres.",
            }
        ];
        this.progress = 0.0;
        this.scrollProgress = 0.0;

        this.gradientRGB = {
            r: this.state.gradientRGB.r,
            g: this.state.gradientRGB.g,
            b: this.state.gradientRGB.b
        }

        this.props.history.listen((location, action) => {
            this.setState({ redirect: true })
            console.group("on route change");
            console.groupEnd()
        });

        this.progressAnimation = TweenLite.to(this, 1.5, {
            progress: 100,
            paused: true,
            onUpdate: () => { this.setState({ progress: this.progress }) },
            // ease: 'CustomEase.create("custom", "M0,0 C0,0 0.294,-0.016 0.4,0.1 0.606,0.326 0.604,0.708 0.684,0.822 0.771,0.946 1,1 1,1")'
            ease: 'CustomEase.create("custom", "M0,0 C0.21,0 0.074,0.458 0.252,0.686 0.413,0.893 0.818,1 1,1")'
        });
    }

    prevImage = () => {
        if (this.state.imageIndex > 0) {
            this.progressAnimation.play();
            this.progressAnimation.eventCallback('onComplete', () => {
                this.handleIndex("prev");
                this.progressComplete();
            });
        } else {
            this.progressAnimation.play();
            this.progressAnimation.eventCallback('onComplete', () => {
                this.setState({ imageIndex: Number(this.images.length - 1) });
                this.progressComplete();
            });
        }
    }

    getGradient = () => {
        let index = this.state.imageIndex;
        const nextGradient = {
            r: this.societiesGradient[index].r,
            g: this.societiesGradient[index].g,
            b: this.societiesGradient[index].b,
        }
        return nextGradient
    }

    gradientAnimation = () => {
        TweenLite.to(
            this.gradientRGB, 2, {
                r: { ...this.getGradient() }.r,
                g: { ...this.getGradient() }.g,
                b: { ...this.getGradient() }.b,
            }
        );
    }

    nextImage = () => {
        if (this.images.length - 1 > this.state.imageIndex) {
            this.progressAnimation.play();
            this.progressAnimation.eventCallback('onComplete', () => {
                this.handleIndex("next");
                this.gradientAnimation();
                this.progressComplete();
            });
        } else {
            this.progressAnimation.play();
            this.progressAnimation.eventCallback('onComplete', () => {
                this.progressComplete();
                this.setState({ imageIndex: Number(0) })
                this.gradientAnimation();
            });
        }
    }

    progressComplete = () => {
        this.progressAnimation.reverse();
        this.setState({ isTicking: false });
    }

    handleIndex = (param) => {
        param === "next"
            ? this.setState({ imageIndex: Number(this.state.imageIndex + 1) })
            : this.setState({ imageIndex: Number(this.state.imageIndex - 1) })
    }

    onWheel = throttle((e) => {
        this.scrollValue = Math.abs(e.deltaY);

        const x = () => { if (this.scrollValue > 200) { this.setState({ isTicking: true }); this.nextImage() } };
        x()

        TweenLite.to(this, .5, {
            scrollProgress: this.scrollValue,
            onUpdate: () => { this.setState({ scrollProgress: this.scrollProgress }); },
            onComplete: () => { this.setBack(); },
            ease: 'CustomEase.create("custom", "M0,0 C0.21,0 0.074,0.458 0.252,0.686 0.413,0.893 0.818,1 1,1")'
        });
    }, 0)

    setBack = debounce(() => {
        TweenLite.to(this, .5, {
            scrollProgress: 0,
            onUpdate: (e) => { this.setState({ scrollProgress: this.scrollProgress }) },
            ease: 'CustomEase.create("custom", "M0,0 C0.21,0 0.074,0.458 0.252,0.686 0.413,0.893 0.818,1 1,1")'
        });
    }, 0);

    componentWillReceiveProps() {
        this.props.cursor_context.updateCursorParams(this.props.position);
    }

    render() {
        const monks = "linear-gradient(to right, rgba(87, 18, 0, 0.2), rgba(87, 18, 0, 0.4))";
        const jarawa = "linear-gradient(to right, rgba(146, 154, 63, 0.2), rgba(146, 154, 63, 0.4))";
        const rasta = "linear-gradient(to right, rgba(63, 154, 146, 0.2), rgba(63, 154, 146, 0.4))";
        const gradients = {
            monks,
            jarawa,
            rasta
        }
        const dynBackground = gradients[this.projects[this.state.imageIndex].name]
        return (
            <div
                onWheel={(e) => { e.persist(); this.onWheel(e); }}
                style={{ display: 'flex', alignItems: "center" }}
            >
                <FullScreen
                    transitionMap={TransitionMap}
                    images={this.images}
                    imageIndex={this.state.imageIndex}
                    progress={this.state.progress}
                    scrollProgress={this.state.scrollProgress}
                    currentImage={this.images[this.state.imageIndex]}
                    nextImage={this.images[this.state.imageIndex + 1]}
                    className="thumbnailCanvas"
                    gradient={dynBackground}
                    gradientRGB={this.gradientRGB}
                />
                <MainUi
                    projectName={this.projects[this.state.imageIndex].intro}
                    projectDescription={this.projects[this.state.imageIndex].description}
                />
            </div>
        )
    }
}

export default compose(withRouter, withCursorContext)(Home)
