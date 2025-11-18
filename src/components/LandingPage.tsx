import React from "react";
import Slider from "react-slick";
import { useNavigate } from 'react-router-dom';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const volunteers = [
  { id: 1, name: "Aditi Sharma", image: "/assets/art1.jpg" },
  { id: 2, name: "Rahul Verma", image: "/assets/art2.jpg" },
  { id: 3, name: "Aditi Sharma", image: "/assets/art3.jpg" },
  { id: 4, name: "Rahul Verma", image: "/assets/art4.jpg" },
  { id: 5, name: "Aditi Sharma", image: "/assets/art5.jpg" },
  // add more
];


const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: true,
};

const carouselSettings = {
  dots: true,
  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: true,
  centerPadding: "0px",
  autoplay: true,
  speed: 800,
  autoplaySpeed: 2000,
  pauseOnHover: true,
  arrows: true,
  className: "sliders",
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white-50 text-gray-900">

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-pink-20 to-white
        bg-[url('/assets/landing-page.jpg')]
        bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="relative z-10">
          <h1 className="text-9xl text-blue-800 sm:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Qala
          </h1>
          <h3 className="text-2xl sm:text-4xl font-extrabold mb-4 drop-shadow-lg">
            Where art meets opportunity
          </h3>
          <p className="text-lg sm:text-2xl mb-6 max-w-2xl drop-shadow-md">
            Your gateway to discovering talented artists and commissioning unique creations.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 border font-semibold border-blue-800 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition shadow-lg drop-shadow-lg">
              Join as Artist
            </button>
            <button className="px-6 py-3 border font-semibold border-blue-900 text-blue-900 rounded-md bg-white/30 hover:bg-pink-50 transition shadow-lg drop-shadow-lg">
              Order Custom Art
            </button>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-white w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          {/* Left Image */}
          <div className="w-full h-full">
            <img
              src="/assets/ourmission1.jpg" // replace with your image
              alt="Left decorative art"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* Mission Text */}
          <div className="flex flex-col justify-center text-center bg-blue-900/50 p-10">
            <h2 className="text-5xl font-extrabold mb-4">Our Mission</h2>
            <p className="text-lg font-medium">
              Qala empowers artists and art lovers by bridging the gap between talent and opportunity, enabling everyone to create, share, and enjoy unique art experiences.
            </p>
          </div>

          {/* Right Image */}
          <div className="w-full h-full">
            <img
              src="/assets/ourmission2.jpg" // replace with your image
              alt="Right decorative art"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Why Qala is Different */}
      <section className="py-20 px-6 bg-blue-100 text-center">
        <h2 className="text-3xl font-semibold mb-8">Why Qala is Different</h2>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-left">
          <div className="bg-blue-900/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">Verified Artists</h3>
            <p>Every artist on Qala is vetted to ensure top-quality creations.</p>
          </div>
          <div className="bg-blue-900/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">Custom Orders</h3>
            <p>Get personalized art pieces tailored to your style and vision.</p>
          </div>
          <div className="bg-blue-900/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">Seamless Experience</h3>
            <p>Easy to browse, commission, and support artists from anywhere.</p>
          </div>
        </div>
      </section>

      {/* Discover Our Collections */}
      <section className="py-20 px-6 w-full bg-blue-100 text-center">
        <h2 className="text-3xl font-semibold mb-8">Discover Our Collections</h2>
        {/* <div className="max-w-full mx-auto grid sm:grid-cols-3 gap-8 text-left"> */}
        <Slider {...carouselSettings}>
          {volunteers.map((v) => (
            <div key={v.id} className="p-4">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img src={v.image} alt={v.name} className="w-full h-64 object-cover" />
                {/* <h3 className="font-semibold text-lg">{v.name}</h3> */}
              </div>
            </div>
          ))}
        </Slider>
        {/* </div> */}
      </section>

      {/* Volunteers */}
      <section className="py-16 px-6 bg-blue-100">
        <h2 className="text-3xl font-bold text-center mb-8">Our Verified Artists</h2>
        <Slider {...carouselSettings}>
          {volunteers.map((v) => (
            <div key={v.id} className="p-4">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <img src={v.image} alt={v.name} className="h-24 w-24 mx-auto rounded-full object-cover mb-4" />
                <h3 className="font-semibold text-lg">{v.name}</h3>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Contact Us Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-100 to-blue-100 text-center">
        <h2 className="text-4xl font-bold mb-4 text-blue-900">Get in Touch</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-10">
          Have a question, a commission idea, or just want to say hello?
          We’d love to hear from you — fill out the form below and we’ll get back to you soon.
        </p>

        <form className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-left">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              id="message"
              rows={5}
              placeholder="Write your message..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-all duration-200 shadow-md"
            >
              Send Message
            </button>
          </div>
        </form>
      </section>


      {/* Footer */}
      <footer className="bg-gradient-to-b bg-blue-900/50 shadow-inner py-10 px-6 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-3xl font-extrabold text-blue-900 mb-2">Qala</h3>
            <p className="text-white text-sm max-w-xs">
              Where creativity meets opportunity — connecting artists and admirers through the language of art.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="font-semibold text-blue-800 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><a href="/" className=" text-white hover:text-blue-600 transition">Home</a></li>
              <li><a href="/user" className="text-white hover:text-blue-600 transition">Artists</a></li>
              <li><a href="#contact" className="text-white hover:text-blue-600 transition">Contact Us</a></li>
              <li><a href="#" className="text-white hover:text-blue-600 transition">About</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-semibold text-blue-800 mb-3">Follow Us</h4>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition transform hover:scale-110">
                <i className="ri-twitter-fill text-2xl"></i>
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition transform hover:scale-110">
                <i className="ri-instagram-line text-2xl"></i>
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition transform hover:scale-110">
                <i className="ri-linkedin-fill text-2xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-100 mt-8 pt-4 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Qala. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
