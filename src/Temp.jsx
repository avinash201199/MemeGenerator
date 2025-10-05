/* eslint-disable react/prop-types */
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import memesMeta from "./memesMeta";

const Temp = ({ temp, setMeme }) => {
  const row1 = useRef(null);
  const row2 = useRef(null);
  const row3 = useRef(null);

  useLayoutEffect(() => {
    const ctx1 = gsap.context(() => {
      animateRow(row1.current, "right");
    }, row1.current);

    const ctx2 = gsap.context(() => {
      animateRow(row2.current, "left");
    }, row2.current);

    const ctx3 = gsap.context(() => {
      animateRow(row3.current, "bottom");
    }, row3.current);

    return () => {
      ctx1.revert();
      ctx2.revert();
      ctx3.revert();
    };
  }, [temp]);

  const animateRow = (rowRef, direction) => {
    gsap.from(rowRef.children, {
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      stagger: {
        amount: 0.2,
        each: 0.1,
      },
      x: direction === "right" ? 100 : direction === "left" ? -100 : 0,
      y: direction === "bottom" ? 100 : 0,
    });
  };

  const renderTemplate = (temps) => (
    <div
      key={temps.id}
      className="template"
      onClick={() => setMeme(temps)}
    >
      <div
        style={{ backgroundImage: `url(${temps.url})` }}
        className="meme"
      ></div>

      {/* Hover caption overlay */}
      <div className="hover-caption">
        {memesMeta[temps.name]?.captions?.join(", ")}
      </div>
    </div>
  );

  return (
    <div className="Templates">
      {/* Row 1 */}
      <div className="row" ref={row1}>
        {temp.slice(0, 3).map(renderTemplate)}
      </div>

      {/* Row 2 */}
      <div className="row" ref={row2}>
        {temp.slice(3, 6).map(renderTemplate)}
      </div>

      {/* Row 3 */}
      <div className="row" ref={row3}>
        {temp.slice(6, 9).map(renderTemplate)}
      </div>
    </div>
  );
};

export default Temp;
