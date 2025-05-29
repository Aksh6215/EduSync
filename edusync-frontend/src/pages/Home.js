import React from 'react';
import { Link } from 'react-router-dom';

const heroImg = 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=900&q=80'; // Royalty-free education/learning image

const Home = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 style={{ fontWeight: 800, fontSize: '3rem', letterSpacing: '-1px' }} className="mb-3 animate__animated animate__fadeInDown">Welcome to EduSync</h1>
        <p className="lead mb-2 animate__animated animate__fadeInDown animate__delay-1s">Smart Learning Management & Assessment Platform</p>
        <p className="mb-4 animate__animated animate__fadeInDown animate__delay-2s">EduSync helps students and instructors manage courses, assessments, and track progress with real-time analytics and cloud integration.</p>
        <div className="mt-4 mb-2 animate__animated animate__fadeIn animate__delay-3s">
          <Link to="/register" className="btn btn-primary me-2 px-4 py-2 fs-5">Register</Link>
          <Link to="/login" className="btn btn-outline-primary px-4 py-2 fs-5">Login</Link>
        </div>
        <div className="mb-4 text-muted animate__animated animate__fadeIn animate__delay-4s" style={{ fontSize: '1.15rem' }}>
          Start your journey to smarter learning today!
        </div>
      </div>
      {/* Feature Highlights */}
      <div className="row justify-content-center mt-5 animate__animated animate__fadeInUp animate__delay-3s">
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow feature-card" style={{ borderRadius: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="card-body py-4">
              <div style={{ fontSize: 48, color: '#6366f1' }}>📚</div>
              <h5 className="card-title mt-3 mb-2" style={{ fontWeight: 700 }}>Easy Course Management</h5>
              <p className="card-text text-secondary">Create, edit, and organize courses with a user-friendly interface.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow feature-card" style={{ borderRadius: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="card-body py-4">
              <div style={{ fontSize: 48, color: '#6366f1' }}>📝</div>
              <h5 className="card-title mt-3 mb-2" style={{ fontWeight: 700 }}>Smart Assessments</h5>
              <p className="card-text text-secondary">Build and grade assessments automatically with instant feedback.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow feature-card" style={{ borderRadius: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="card-body py-4">
              <div style={{ fontSize: 48, color: '#6366f1' }}>📊</div>
              <h5 className="card-title mt-3 mb-2" style={{ fontWeight: 700 }}>Real-Time Analytics</h5>
              <p className="card-text text-secondary">Track student progress and performance with beautiful dashboards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Feature card hover effect */}
    <style>{`
      .feature-card:hover {
        transform: translateY(-8px) scale(1.03);
        box-shadow: 0 12px 36px rgba(99,102,241,0.12);
      }
      .animate__animated { animation-duration: 1s; animation-fill-mode: both; }
      .animate__fadeInDown { animation-name: fadeInDown; }
      .animate__fadeIn { animation-name: fadeIn; }
      .animate__fadeInUp { animation-name: fadeInUp; }
      .animate__zoomIn { animation-name: zoomIn; }
      .animate__delay-1s { animation-delay: 0.3s; }
      .animate__delay-2s { animation-delay: 0.6s; }
      .animate__delay-3s { animation-delay: 0.9s; }
      .animate__delay-4s { animation-delay: 1.2s; }
      @keyframes fadeInDown { from { opacity: 0; transform: translate3d(0, -40px, 0); } to { opacity: 1; transform: none; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: none; } }
      @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `}</style>
  </div>
);

export default Home; 