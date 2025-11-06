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

  // Modified: play video and move to next when finished
  const playVideoSafely = (video, onEnd) => {
    if (!video) return;
    video.muted = true;
    const container = video.closest(".video-container");

    const tryPlay = () => {
      video.play()
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

  // 🔥 simplified animation flow
  const triggerBannerSequence = (slide) => {
    const banners = slide.querySelectorAll(".split-banner");
    banners.forEach((b) => {
      b.classList.remove("animate-marquee", "animate-split", "animate-marquee-closed");
      b.classList.add("animate-marquee-closed");
    });

    // open split once after small delay
    setTimeout(() => {
      banners.forEach((b) => {
        b.classList.remove("animate-marquee-closed");
        b.classList.add("animate-split");
      });
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

        // Set video duration for active indicator animation BEFORE setting active class
        const setVideoDuration = () => {
          if (video && video.duration && indicatorsRef.current[index]) {
            const duration = video.duration * 1000; // Convert to milliseconds
            indicatorsRef.current[index].style.setProperty('--video-duration', `${duration}ms`);
          }
        };

        // Set duration when video is ready (before showing slide)
        if (video) {
          if (video.readyState >= 2 && video.duration) {
            setVideoDuration();
          } else {
            video.addEventListener('loadedmetadata', () => {
              setVideoDuration();
            }, { once: true });
            video.load(); // Force load if needed
          }
        }

        // ✅ move to next slide after video ends
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
      const isActive = i === index;
      
      if (isActive) {
        // Ensure duration is ALWAYS set before adding active class (especially for first indicator)
        const video = slidesRef.current[index]?.querySelector(".hero-video");
        if (video && video.duration) {
          const duration = video.duration * 1000;
          el.style.setProperty('--video-duration', `${duration}ms`);
          // Force style recalculation to ensure CSS variable is applied
          void el.offsetWidth;
        }
        // Reset animation to restart from beginning
        el.classList.remove("active");
        void el.offsetWidth; // Force reflow
        el.classList.add("active");
      } else {
        // Reset inactive indicators immediately without animation
        el.classList.remove("active");
        el.style.setProperty('--video-duration', '0ms');
        void el.offsetWidth; // Force reflow to reset animation
      }
    });

    if (animate && previousIndex !== index) {
      setTimeout(() => setIsTransitioning(false), 800);
    } else {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    // Preload all videos and set their durations before showing first slide
    const preloadVideos = () => {
      const videos = slidesRef.current.map(slide => slide?.querySelector(".hero-video"));
      let loadedCount = 0;
      const totalVideos = videos.filter(v => v).length;
      let firstVideoDurationSet = false;

      const setDurationForIndex = (video, index) => {
        if (video.duration && indicatorsRef.current[index]) {
          const duration = video.duration * 1000;
          indicatorsRef.current[index].style.setProperty('--video-duration', `${duration}ms`);
          
          // Track if first video duration is set
          if (index === 0) {
            firstVideoDurationSet = true;
          }
        }
      };

      const checkAllLoaded = () => {
        loadedCount++;
        // Only show first slide after first video duration is set AND all videos are loaded
        if (loadedCount >= totalVideos && firstVideoDurationSet) {
          // Small delay to ensure CSS variable is applied
          setTimeout(() => {
            showSlide(0, false);
          }, 50);
        }
      };

      videos.forEach((video, index) => {
        if (video) {
          const setDuration = () => {
            setDurationForIndex(video, index);
            checkAllLoaded();
          };

          if (video.readyState >= 2 && video.duration) {
            setDuration();
          } else {
            video.addEventListener('loadedmetadata', setDuration, { once: true });
            video.load(); // Force load
          }
        }
      });

      // Fallback: if first video doesn't load within 3 seconds, set a default and show slide
      setTimeout(() => {
        if (!firstVideoDurationSet && videos[0] && indicatorsRef.current[0]) {
          // Set a default duration if video hasn't loaded
          const defaultDuration = 5000; // 5 seconds default
          indicatorsRef.current[0].style.setProperty('--video-duration', `${defaultDuration}ms`);
          firstVideoDurationSet = true;
          if (loadedCount >= totalVideos) {
            showSlide(0, false);
          }
        }
      }, 3000);
    };

    preloadVideos();
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
            </div>
            <div className="video-container">
              <video
                className="hero-video"
                muted
                playsInline
                preload="auto"
              >
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
            </div>
            <div className="video-container">
              <video
                className="hero-video"
                muted
                playsInline
                preload="auto"
              >
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
            </div>
            <div className="video-container">
              <video
                className="hero-video"
                muted
                playsInline
                preload="auto"
              >
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