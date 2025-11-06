import React, { useEffect, useRef } from "react";
import "../class.css";

const ClassesPage = () => {
  const fixedDescriptionRef = useRef(null);
  const stickyTitleRef = useRef(null);

  useEffect(() => {
    const titleElement = document.querySelector(".sticky-title span");
    const letters = "CLASSES".split("");
    titleElement.innerHTML = letters
      .map((letter) => `<span class="letter">${letter}</span>`)
      .join("");

    const letterElements = document.querySelectorAll(".letter");
    const bannerHeight = window.innerHeight; // Carousel is 100vh

    const onScroll = () => {
      const scrollY = window.scrollY;
      const scrollProgress =
        scrollY / (document.body.scrollHeight - window.innerHeight);
      const totalLetters = letterElements.length;
      const visibleLetters = Math.floor(scrollProgress * (totalLetters + 1));

      letterElements.forEach((el, i) => {
        el.style.opacity = i < visibleLetters ? "1" : "0.1";
        el.style.transform = i < visibleLetters ? "translateY(0)" : "translateY(1rem)";
      });

      // Hide sticky-title (CLASSES text) when in banner/carousel area
      if (stickyTitleRef.current) {
        if (scrollY < bannerHeight) {
          // In banner area - hide CLASSES text
          stickyTitleRef.current.style.opacity = "0";
          stickyTitleRef.current.style.visibility = "hidden";
          stickyTitleRef.current.style.pointerEvents = "none";
        } else {
          // Out of banner area - show CLASSES text
          stickyTitleRef.current.style.opacity = "1";
          stickyTitleRef.current.style.visibility = "visible";
          stickyTitleRef.current.style.pointerEvents = "auto";
        }
      }

      // Hide fixed-description when in banner area
      if (fixedDescriptionRef.current) {
        const descriptionP = fixedDescriptionRef.current.querySelector("p");
        if (descriptionP) {
          if (scrollY < bannerHeight) {
            // In banner area - hide
            descriptionP.style.opacity = "0";
            descriptionP.style.visibility = "hidden";
          } else {
            // Out of banner area - show
            descriptionP.style.opacity = "1";
            descriptionP.style.visibility = "visible";
          }
        }
      }
    };

    // Initial check
    onScroll();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="classes-section">
      <h1 className="sticky-title" ref={stickyTitleRef}>
        <span aria-hidden="true">CLASSES</span>
      </h1>

      <div className="fixed-description" ref={fixedDescriptionRef}>
        <p>
          THE MOST EXCITING CLASSES, CREATED BY TOP INSTRUCTORS. NO MATTER YOUR
          GOAL, WE CAN MAKE IT HAPPEN.
        </p>
      </div>

      <section data-word="BUILDING">
        <img src="https://picsum.photos/400/400?random=3" alt="Section 3" />
      </section>
      <section data-word="GROWTH">
        <img src="https://picsum.photos/400/400?random=4" alt="Section 4" />
      </section>
      <section data-word="SUCCESS">
        <img src="https://picsum.photos/400/400?random=5" alt="Section 5" />
      </section>
      <section data-word="REPEAT">
        <img src="https://picsum.photos/400/400?random=6" alt="Section 6" />
      </section>
      <section data-word="READY">
        <img src="https://picsum.photos/400/400?random=7" alt="Section 7" />
      </section>
    </main>
  );
};

export default ClassesPage;
