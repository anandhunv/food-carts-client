import React, { useState } from "react";
import bannerImg from "/images/home/banner.png";
import hoverImg from "/images/home/banner1.png"; // Import the hover image
import { useTheme } from "../hooks/ThemeContext";
import { Link } from "react-router-dom";

const Banner = () => {
  const { isDarkMode } = useTheme();
  
  // State to manage image source
  const [currentImg, setCurrentImg] = useState(bannerImg);

  return (
    <div className={`max-w-screen-2xl container mx-auto xl:px-24 bg-gradient-to-r from-0% from-[#FAFAFA] to-[#FCFCFC] to-100% ${isDarkMode ? 'dark' : ''}`}>
      <div className={`py-24 flex flex-col md:flex-row-reverse items-center justify-between gap-8 ${isDarkMode ? 'text-white' : ''}`}>

        {/* img */}
        <div className="md:w-1/2">
          <img 
            src={currentImg} 
            alt="Banner"
            onMouseEnter={() => setCurrentImg(hoverImg)}  // Change to hover image
            onMouseLeave={() => setCurrentImg(bannerImg)}  // Revert to original image
          />
        </div>

        {/* texts */}
        <div className="md:w-1/2 px-4 space-y-7">
          <h2 className="md:text-5xl text-4xl font-bold md:leading-snug leading-snug">
            Indulge in the Flavors of <span className="text-green">Gourmet Delight</span>
          </h2>
          <p className="text-[#4A4A4A] text-xl">
            Savor Every Bite, Crafted with Expertise and Filled with Unmatched Flavor
          </p>
          <Link to="/menu" className="bg-green font-semibold btn text-white px-8 py-3 rounded-full">
            <button>
              Order Now
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Banner;
