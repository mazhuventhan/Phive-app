import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style.css";
import video1 from "../assets/videos/fit1.mp4";
import video2 from "../assets/videos/fit2.mp4";
import video3 from "../assets/videos/fit3.mp4";

const Carousel = () => {
  const slidesRef = useRef([]);
  const indicatorsRef = useRef([]);
  const timeoutsRef = useRef([]);
  const currentIndexRef = useRef(0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSlides = 3;

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Video playback helper
  const playVideoSafely = (video, onEnd) => {
    if (!video) return;
    video.muted = true;
    const container = video.closest(".video-container");

    const tryPlay = () => {
      video
        .play()
        .then(() => {
          if (container) container.classList.add("playing");
          if (onEnd) {
            video.onended = onEnd;
          }
        })
        .catch(() => {});
    };

    if (video.readyState >= 3) tryPlay();
    else video.addEventListener("canplay", tryPlay, { once: true });
  };

  const pauseVideo = (video) => {
    if (!video) return;
    video.pause();
    const container = video.closest(".video-container");
    if (container) container.classList.remove("playing");
  };

  // ✨ SMOOTH SPLIT + 3D TEXT ANIMATION
  const triggerBannerSequence = (slide) => {
    const banners = slide.querySelectorAll(".split-banner");

    banners.forEach((b) => {
      b.classList.remove("animate-marquee", "animate-split", "animate-marquee-closed");
      b.classList.add("animate-marquee-closed");
    });

    // Hold closed for 2s, then split smoothly
    setTimeout(() => {
      banners.forEach((b) => {
        b.classList.remove("animate-marquee-closed");
        b.classList.add("animate-split");

        // Animate letters with delay and spacing
        const textWrappers = b.querySelectorAll(".text-wrapper span");
        textWrappers.forEach((tw) => {
          const text = tw.textContent.trim();
          const letters = text.split("");
          tw.innerHTML = "";
          letters.forEach((letter, i) => {
            const span = document.createElement("span");
            span.textContent = letter;
            span.style.animationDelay = `${i * 0.12 + 0.5}s`; // delay per letter
            span.classList.add("letter-3d");
            tw.appendChild(span);
          });
        });
      });
    }, 2000); // keep closed for 2s
  };

  const showSlide = (index, animate = true) => {
    if (isTransitioning && animate && currentSlide !== index) {
      setTimeout(() => showSlide(index, animate), 100);
      return;
    }
    const previousIndex = currentSlide;
    setIsTransitioning(animate && previousIndex !== index);

    slidesRef.current.forEach((slide, i) => {
      const video = slide.querySelector(".hero-video");
      if (i === index) {
        slide.classList.add("active");
        slide.style.transform = "translateX(0)";
        slide.style.opacity = "1";

        triggerBannerSequence(slide);

        // Move to next slide after video ends
        playVideoSafely(video, () => {
          const next = (index + 1) % totalSlides;
          showSlide(next, true);
        });
      } else {
        slide.classList.remove("active");
        slide.style.transform = "translateX(100%)";
        slide.style.opacity = "0";
        pauseVideo(video);
      }
    });

    setCurrentSlide(index);
    currentIndexRef.current = index;
    indicatorsRef.current.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });

    if (animate && previousIndex !== index) {
      setTimeout(() => setIsTransitioning(false), 800);
    } else {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    showSlide(0, false);
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {/* Slide 1 */}
        <div className="carousel-slide" ref={(el) => (slidesRef.current[0] = el)}>
          <div className="slide-content slide-1">
            <div className="banner-wrapper split-banner">
              <div className="top-banner yellow-banner banner-part">
                <div className="banner-text">
                  <div className="text-wrapper">
                    <span>PHIVE PORTO</span>
                  </div>
                </div>
              </div>
              <div className="bottom-banner yellow-banner banner-part">
                <div className="banner-text">
                  <div className="text-wrapper">
                    <span>PHIVE PORTO</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="video-container">
              <video className="hero-video" muted playsInline preload="auto">
                <source src={video1} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="carousel-slide" ref={(el) => (slidesRef.current[1] = el)}>
          <div className="slide-content slide-2">
            <div className="banner-wrapper split-banner">
              <div className="top-banner yellow-banner banner-part">
                <div className="banner-text">
                  <div className="text-wrapper">
                    <span>PHIVE</span>
                  </div>
                </div>
              </div>
              <div className="bottom-banner yellow-banner banner-part">
                <div className="banner-text">
                  <div className="text-wrapper">
                    <span>PORTO</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="video-container">
              <video className="hero-video" muted playsInline preload="auto">
                <source src={video2} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Slide 3 */}
        <div className="carousel-slide" ref={(el) => (slidesRef.current[2] = el)}>
          <div className="slide-content slide-3">
            <div className="banner-wrapper split-banner">
              <div className="top-banner pink-banner banner-part">
                <div className="banner-text-large">
                  <div className="text-wrapper">
                    <span>TRAIN</span>
                  </div>
                </div>
              </div>
              <div className="bottom-banner pink-banner banner-part">
                <div className="banner-text-large">
                  <div className="text-wrapper">
                    <span>EVERY DAY</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="video-container">
              <video className="hero-video" muted playsInline preload="auto">
                <source src={video3} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="carousel-indicators">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`indicator ${i === 0 ? "active" : ""}`}
            ref={(el) => (indicatorsRef.current[i] = el)}
            onClick={() => !isTransitioning && showSlide(i, true)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
