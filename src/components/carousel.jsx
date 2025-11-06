import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style.css";
import video1 from "../assets/videos/fit3.mp4";
import video2 from "../assets/videos/fit1.mp4";
import video3 from "../assets/videos/fit2.mp4";

const Carousel = () => {
  const slidesRef = useRef([]);
  const indicatorsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSlides = 3;

  const playVideoSafely = (video, onEnd) => {
    if (!video) return;
    video.muted = true;
    const container = video.closest(".video-container");
    const darkBg = video.closest(".slide-content")?.querySelector(".dark-green-bg");

    const tryPlay = () => {
      video
        .play()
        .then(() => {
          if (container) container.classList.add("playing");
          if (darkBg) darkBg.classList.add("hide");
          if (onEnd) video.onended = onEnd;
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

  const triggerBannerSequence = (slide) => {
    const banners = slide.querySelectorAll(".split-banner");
    const videoContainer = slide.querySelector(".video-container");
    const darkBg = slide.querySelector(".dark-green-bg");

    // Reset to video visible, green hidden
    if (videoContainer && darkBg) {
      videoContainer.classList.add("playing");
      darkBg.classList.add("hide");
    }

    banners.forEach((b) => {
      b.classList.remove("animate-marquee", "animate-split", "animate-marquee-closed");
      b.classList.add("animate-marquee-closed");
    });

    // Start combine (center join)
    // At this moment, hide video and show dark background
    setTimeout(() => {
      if (videoContainer && darkBg) {
        videoContainer.classList.remove("playing");
        darkBg.classList.remove("hide");
      }
    }, 300); // small delay to sync with join

    // After combined, then split again after 1s
    setTimeout(() => {
      banners.forEach((b) => {
        b.classList.remove("animate-marquee-closed");
        b.classList.add("animate-split");
      });

      // When split starts, show video again, hide dark bg
      setTimeout(() => {
        if (videoContainer && darkBg) {
          videoContainer.classList.add("playing");
          darkBg.classList.add("hide");
        }
      }, 1000);
    }, 1000);
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
      if (!el) return;
      if (i === index) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    if (animate && previousIndex !== index) {
      setTimeout(() => setIsTransitioning(false), 800);
    } else {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    showSlide(0, false);
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {[video1, video2, video3].map((videoSrc, i) => (
          <div className="carousel-slide" key={i} ref={(el) => (slidesRef.current[i] = el)}>
            <div className={`slide-content slide-${i + 1}`}>
              <div className="banner-wrapper split-banner">
                {i === 0 && (
                  <>
                    <div className="top-banner yellow-banner banner-part">
                      <div className="banner-text">
                        <div className="text-wrapper">
                          <span>PHIVE PORTO</span>
                          <span>PHIVE PORTO</span>
                        </div>
                      </div>
                    </div>
                    <div className="bottom-banner yellow-banner banner-part">
                      <div className="banner-text">
                        <div className="text-wrapper">
                          <span>PHIVE PORTO</span>
                          <span>PHIVE PORTO</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="top-banner yellow-banner banner-part">
                      <div className="banner-text">
                        <div className="text-wrapper">
                          <span>PHIVE</span>
                          <span>PHIVE</span>
                        </div>
                      </div>
                    </div>
                    <div className="bottom-banner yellow-banner banner-part">
                      <div className="banner-text">
                        <div className="text-wrapper">
                          <span>PORTO</span>
                          <span>PORTO</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {i === 2 && (
                  <>
                    <div className="top-banner pink-banner banner-part">
                      <div className="banner-text-large">
                        <div className="text-wrapper">
                          <span>TRAIN</span>
                          <span>TRAIN</span>
                        </div>
                      </div>
                    </div>
                    <div className="bottom-banner pink-banner banner-part">
                      <div className="banner-text-large">
                        <div className="text-wrapper">
                          <span>EVERY DAY</span>
                          <span>EVERY DAY</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dark green background */}
              <div className="dark-green-bg hide"></div>

              {/* Video */}
              <div className="video-container">
                <video className="hero-video" muted playsInline preload="auto">
                  <source src={videoSrc} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        ))}
      </div>

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
