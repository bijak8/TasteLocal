
import { useState } from 'react';
import { Link } from 'react-router-dom';

/* =================================
   SHARED INFORMATION COMPONENTS
================================= */

function InfoHero({ eyebrow, title, description }) {
  return (
    <section className="info-hero">
      <div className="info-container">
        <span className="info-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

function InfoLayout({ children }) {
  return <main className="info-page">{children}</main>;
}

function InfoCard({ number, title, children }) {
  return (
    <article className="info-card">
      {number && <span className="info-number">{number}</span>}
      <h3>{title}</h3>
      <div className="info-card-text">{children}</div>
    </article>
  );
}

/* =================================
   ABOUT TASTELOCAL
================================= */

export function About() {
  return (
    <InfoLayout>
      <InfoHero
        eyebrow="OUR STORY"
        title="Discover the Flavours of Local Culture"
        description="TasteLocal connects travellers with authentic local food experiences, guided food tours and the people who make every destination special."
      />

      <section className="info-section">
        <div className="info-container info-two-column">
          <div>
            <span className="info-section-label">WHO WE ARE</span>
            <h2>More Than Just Food Discovery</h2>
            <p>
              TasteLocal is a local food tourism platform designed
              to help travellers discover food experiences and
              guided food tours offered by local businesses.
            </p>
            <p>
              We bring tourists, local food vendors and tour
              operators together through one convenient platform.
            </p>
          </div>

          <div className="info-highlight">
            <span className="info-highlight-icon">✦</span>
            <h3>Every Destination Has a Story to Taste.</h3>
            <p>
              Explore local traditions, discover hidden food
              experiences and connect with the people behind
              the flavours.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section info-section-soft">
        <div className="info-container">
          <div className="info-section-heading">
            <span className="info-section-label">OUR PURPOSE</span>
            <h2>What We Aim to Achieve</h2>
          </div>

          <div className="info-card-grid">
            <InfoCard title="Discover Local Food">
              Help travellers find trusted local food experiences
              and guided food tours.
            </InfoCard>

            <InfoCard title="Support Local Vendors">
              Give small food businesses an accessible platform
              to showcase their offerings.
            </InfoCard>

            <InfoCard title="Connect Communities">
              Encourage meaningful connections between travellers
              and local food providers.
            </InfoCard>
          </div>
        </div>
      </section>

      <section className="info-cta">
        <h2>Your Next Food Adventure Starts Here</h2>
        <p>Explore food experiences and tours waiting to be discovered.</p>

        <div className="info-actions">
          <Link to="/food-experiences" className="info-btn-primary">
            Explore Experiences
          </Link>
          <Link to="/food-tours" className="info-btn-secondary">
            Discover Food Tours
          </Link>
        </div>
      </section>
    </InfoLayout>
  );
}

/* =================================
   INTERACTIVE TUTORIAL COMPONENT
================================= */

function StepTutorial({ steps, dashboardLink, dashboardLabel }) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="tutorial-wrapper">

      <div className="tutorial-progress">
        <div className="tutorial-progress-top">
          <span>YOUR PROGRESS</span>
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="tutorial-progress-track">
          <div
            className="tutorial-progress-fill"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="tutorial-step-indicators">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`tutorial-step-dot ${
              index === currentStep ? 'active' : ''
            } ${index < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(index)}
            aria-label={`Go to step ${index + 1}: ${item.title}`}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            {index < currentStep ? '✓' : index + 1}
          </button>
        ))}
      </div>

      <article className="tutorial-step-card">
        <div className="tutorial-step-heading">
          <span className="tutorial-step-number">
            STEP {String(currentStep + 1).padStart(2, '0')}
          </span>

          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>

        <div className="tutorial-instructions">
          <h4>What you need to do</h4>

          <ol>
            {step.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        {step.tip && (
          <div className="tutorial-tip">
            <span>✦ Helpful tip</span>
            <p>{step.tip}</p>
          </div>
        )}

        {step.link && (
          <Link to={step.link} className="tutorial-action-link">
            {step.linkLabel || 'Open this feature'} →
          </Link>
        )}
      </article>

      <div className="tutorial-navigation">
        <button
          type="button"
          className="tutorial-prev-btn"
          onClick={() => setCurrentStep((previous) => previous - 1)}
          disabled={currentStep === 0}
        >
          ← Previous
        </button>

        {!isLastStep ? (
          <button
            type="button"
            className="tutorial-next-btn"
            onClick={() => setCurrentStep((previous) => previous + 1)}
          >
            Next Step →
          </button>
        ) : (
          <Link
            to={dashboardLink}
            className="tutorial-next-btn tutorial-dashboard-btn"
          >
            {dashboardLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}

/* =================================
   VENDOR GUIDE
================================= */

export function VendorGuide() {
  const steps = [
    {
      title: 'Access Your Vendor Account',
      description:
        'Start by registering for TasteLocal and accessing your vendor dashboard.',
      instructions: [
        'Open the TasteLocal registration page.',
        'Create an account using your details.',
        'Select the vendor account type if the registration flow offers this option.',
        'Log in and open your Vendor Dashboard.'
      ],
      tip: 'Use an active email address so you can receive important account and booking updates.',
      link: '/register',
      linkLabel: 'Go to Registration'
    },
    {
      title: 'Complete Your Business Profile',
      description:
        'Introduce your business to travellers by providing accurate business information.',
      instructions: [
        'Open your Vendor Dashboard.',
        'Navigate to your business profile.',
        'Enter your business name and owner information.',
        'Add your business description and contact details.',
        'Provide your business address and location.',
        'Upload your business logo or profile image if available.',
        'Save your changes.'
      ],
      tip: 'Use a clear business description to help travellers understand what your business offers.',
      link: '/vendor/profile',
      linkLabel: 'Open Vendor Profile'
    },
    {
      title: 'Create a Food Experience',
      description:
        'Create a listing to showcase your food experience to travellers.',
      instructions: [
        'Open your Vendor Dashboard.',
        'Select Create Experience.',
        'Enter the experience title.',
        'Write a description explaining the activity and what participants can expect.',
        'Select the appropriate food experience category.',
        'Enter the price and required experience information.',
        'Provide the location and upload an attractive cover image.',
        'Review your information and save or submit the listing.'
      ],
      tip: 'Use high-quality photographs and informative descriptions to make your experience more appealing.',
      link: '/vendor/create-experience',
      linkLabel: 'Create Food Experience'
    },
    {
      title: 'Manage Your Food Experiences',
      description:
        'Review your existing listings and keep their information up to date.',
      instructions: [
        'Open your Vendor Dashboard.',
        'Find your food experience listings.',
        'Select the experience you want to manage.',
        'Review the listing information.',
        'Use the available edit function to update details.',
        'Save your changes.'
      ],
      tip: 'Keep your descriptions, prices, images and location information accurate.',
      link: '/vendor/dashboard',
      linkLabel: 'Open Vendor Dashboard'
    },
    {
      title: 'Manage Booking Requests',
      description:
        'Review booking requests submitted by travellers and update their booking status.',
      instructions: [
        'Open the booking management page.',
        'Review the incoming booking requests.',
        'Open a booking to check the customer and reservation details.',
        'Review the requested experience, date and participant information.',
        'Accept or reject the booking request using the available action.',
        'Check the updated booking status.'
      ],
      tip: 'Review booking details carefully before accepting or rejecting a request.',
      link: '/provider/bookings',
      linkLabel: 'Manage Bookings'
    },
    {
      title: 'Review Customer Feedback',
      description:
        'Use customer feedback to understand how travellers experience your offerings.',
      instructions: [
        'Open your provider reviews page.',
        'Review the ratings and feedback submitted by customers.',
        'Read comments to understand areas that customers appreciate or want improved.',
        'Use the feedback to improve your food experiences.'
      ],
      tip: 'Positive and constructive customer feedback can help you improve the quality of your offerings.',
      link: '/provider/reviews',
      linkLabel: 'View Customer Reviews'
    }
  ];

  return (
    <InfoLayout>
      <InfoHero
        eyebrow="VENDOR LEARNING CENTRE"
        title="Your Guide to Becoming a TasteLocal Vendor"
        description="Follow this step-by-step tutorial to set up your business, create food experiences and manage customer bookings on TasteLocal."
      />

      <section className="info-section">
        <div className="info-container">
          <div className="info-section-heading">
            <span className="info-section-label">
              VENDOR ONBOARDING
            </span>
            <h2>Learn How to Use TasteLocal</h2>
            <p>
              Work through each step at your own pace. You can move
              backwards or forwards whenever you need.
            </p>
          </div>

          <StepTutorial
            steps={steps}
            dashboardLink="/vendor/dashboard"
            dashboardLabel="Go to Vendor Dashboard"
          />
        </div>
      </section>

      <section className="info-cta">
        <h2>Ready to Showcase Your Food Business?</h2>
        <p>
          Start creating food experiences and connect with travellers.
        </p>
        <Link to="/vendor/dashboard" className="info-btn-primary">
          Open Vendor Dashboard
        </Link>
      </section>
    </InfoLayout>
  );
}

/* =================================
   TOUR OPERATOR GUIDE
================================= */

export function TourOperatorGuide() {
  const steps = [
    {
      title: 'Access Your Tour Operator Account',
      description:
        'Register for TasteLocal and access your tour operator dashboard.',
      instructions: [
        'Open the TasteLocal registration page.',
        'Create an account using your details.',
        'Select the tour operator account type if the registration flow offers this option.',
        'Log in and open your Operator Dashboard.'
      ],
      tip: 'Use accurate business and contact information when registering.',
      link: '/register',
      linkLabel: 'Go to Registration'
    },
    {
      title: 'Complete Your Operator Profile',
      description:
        'Provide information about your tour business so travellers can learn more about your services.',
      instructions: [
        'Open your Operator Dashboard.',
        'Navigate to your operator profile.',
        'Enter your business name and owner information.',
        'Add your business description and contact details.',
        'Provide your website and social media details if available.',
        'Save your profile.'
      ],
      tip: 'A complete profile helps travellers understand your business and the tours you offer.',
      link: '/operator/profile',
      linkLabel: 'Open Operator Profile'
    },
    {
      title: 'Create a Food Tour',
      description:
        'Add a new guided food tour for travellers to discover.',
      instructions: [
        'Open your Operator Dashboard.',
        'Select Create Food Tour.',
        'Enter the food tour title.',
        'Write a description of the tour and its highlights.',
        'Select the appropriate category if available.',
        'Enter the required price and tour information.',
        'Upload an attractive cover image.',
        'Review the details and save or submit your food tour.'
      ],
      tip: 'Choose a descriptive title and use appealing images to showcase the food tour.',
      link: '/operator/create-tour',
      linkLabel: 'Create Food Tour'
    },
    {
      title: 'Add Tour Stops',
      description:
        'Build your food tour itinerary by adding the places participants will visit.',
      instructions: [
        'Open the Add Tour Stop page.',
        'Select the food tour you want to manage.',
        'Choose or enter the relevant tour stop details.',
        'Provide the stop name, description and location as required.',
        'Add the stops in the intended visit sequence.',
        'Repeat until your tour contains at least 3 and no more than 5 stops.',
        'Save your tour stops.'
      ],
      tip: 'Plan a logical route and arrange the stops in the order travellers should visit them.',
      link: '/operator/add-tour-stop',
      linkLabel: 'Add Tour Stops'
    },
    {
      title: 'Manage Your Food Tours',
      description:
        'Review your existing tours and make updates when necessary.',
      instructions: [
        'Open your Operator Dashboard.',
        'Find your existing food tours.',
        'Select the tour you want to manage.',
        'Review the tour details and its associated stops.',
        'Use the available edit functions to update information.',
        'Save your changes.'
      ],
      tip: 'Check that your tour description and tour stops remain accurate and consistent.',
      link: '/operator/dashboard',
      linkLabel: 'Open Operator Dashboard'
    },
    {
      title: 'Manage Booking Requests',
      description:
        'Handle booking requests submitted by travellers interested in your food tours.',
      instructions: [
        'Open the booking management page.',
        'Review incoming booking requests.',
        'Open a booking to view its details.',
        'Check the customer, participant and reservation information.',
        'Accept or reject the booking request using the available action.',
        'Review the updated booking status.'
      ],
      tip: 'Check the booking details before making a decision.',
      link: '/provider/bookings',
      linkLabel: 'Manage Bookings'
    },
    {
      title: 'Review Customer Feedback',
      description:
        'Learn from customer reviews and use feedback to improve your food tours.',
      instructions: [
        'Open your provider reviews page.',
        'Review customer ratings and comments.',
        'Identify feedback about the tour experience and individual stops.',
        'Use the feedback to improve future tours.'
      ],
      tip: 'Customer feedback can help you identify opportunities to improve your tour itinerary.',
      link: '/provider/reviews',
      linkLabel: 'View Customer Reviews'
    }
  ];

  return (
    <InfoLayout>
      <InfoHero
        eyebrow="TOUR OPERATOR LEARNING CENTRE"
        title="Your Guide to Creating Food Tours"
        description="Learn how to set up your operator profile, create guided food tours, add tour stops and manage traveller bookings."
      />

      <section className="info-section">
        <div className="info-container">
          <div className="info-section-heading">
            <span className="info-section-label">
              TOUR OPERATOR ONBOARDING
            </span>
            <h2>Learn How to Manage Your Food Tours</h2>
            <p>
              Follow the tutorial step by step to learn the main
              features available to tour operators.
            </p>
          </div>

          <StepTutorial
            steps={steps}
            dashboardLink="/operator/dashboard"
            dashboardLabel="Go to Operator Dashboard"
          />
        </div>
      </section>

      <section className="info-cta">
        <h2>Ready to Share Your Food Tours?</h2>
        <p>
          Create your food tours and introduce travellers to local food culture.
        </p>
        <Link to="/operator/dashboard" className="info-btn-primary">
          Open Operator Dashboard
        </Link>
      </section>
    </InfoLayout>
  );
}

/* =================================
   HELP CENTRE
================================= */

export function HelpCentre() {
  const topics = [
    {
      title: 'Account & Registration',
      description: 'Learn how to register, log in and manage your account.',
      link: '/register'
    },
    {
      title: 'Food Experiences',
      description: 'Discover local food experiences and find listing details.',
      link: '/food-experiences'
    },
    {
      title: 'Food Tours',
      description: 'Explore guided food tours and their tour stops.',
      link: '/food-tours'
    },
    {
      title: 'Bookings',
      description: 'Learn how to submit and manage booking requests.',
      link: '/my-bookings'
    },
    {
      title: 'Itineraries & Favourites',
      description: 'Organise your saved food experiences and tours.',
      link: '/my-itineraries'
    },
    {
      title: 'Vendor & Operator Support',
      description: 'Learn how to manage listings, sessions and bookings.',
      link: '/for-vendors'
    }
  ];

  return (
    <InfoLayout>
      <InfoHero
        eyebrow="WE ARE HERE TO HELP"
        title="TasteLocal Help Centre"
        description="Find guidance and useful information to help you make the most of TasteLocal."
      />

      <section className="info-section">
        <div className="info-container">
          <div className="info-section-heading">
            <span className="info-section-label">HOW CAN WE HELP?</span>
            <h2>Browse Help Topics</h2>
          </div>

          <div className="info-card-grid">
            {topics.map((topic) => (
              <InfoCard key={topic.title} title={topic.title}>
                <p>{topic.description}</p>
                <Link className="info-text-link" to={topic.link}>
                  Learn more →
                </Link>
              </InfoCard>
            ))}
          </div>

          <div className="info-help-note">
            <h3>Still Need Help?</h3>
            <p>
              Visit our Frequently Asked Questions page for
              additional information.
            </p>
            <Link to="/faqs" className="info-btn-primary">
              View FAQs
            </Link>
          </div>
        </div>
      </section>
    </InfoLayout>
  );
}

/* =================================
   FAQS
================================= */

export function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const questions = [
    {
      question: 'What is TasteLocal?',
      answer:
        'TasteLocal is a platform that helps travellers discover local food experiences and guided food tours offered by local vendors and tour operators.'
    },
    {
      question: 'How do I create a TasteLocal account?',
      answer:
        'Select Register and follow the registration process. Choose the appropriate account type and provide the requested information.'
    },
    {
      question: 'How do I book a food experience?',
      answer:
        'Browse food experiences, open a listing, select an available session and submit your booking request.'
    },
    {
      question: 'How do I book a food tour?',
      answer:
        'Browse food tours, view the tour details and stops, select an available session and submit your booking request.'
    },
    {
      question: 'How can I check my booking status?',
      answer:
        'Log in to your account and visit My Bookings to review your booking requests and their current status.'
    },
    {
      question: 'Can I save my favourite listings?',
      answer:
        'Yes. Use the favourites feature on supported food experience and food tour listings to save items for later.'
    },
    {
      question: 'Can I create an itinerary?',
      answer:
        'Yes. You can add supported food experiences and food tours to your itinerary and view your saved itinerary items.'
    },
    {
      question: 'How can I become a vendor?',
      answer:
        'Register for a vendor account and complete your business profile. Refer to the For Vendors guide for more information.'
    },
    {
      question: 'How can I become a tour operator?',
      answer:
        'Register using the tour operator option and complete your business profile. Refer to the For Tour Operators guide.'
    },
    {
      question: 'Does TasteLocal accept online payments?',
      answer:
        'Online payment processing is not currently included in this version of TasteLocal. Booking requests are submitted through the platform.'
    }
  ];

  return (
    <InfoLayout>
      <InfoHero
        eyebrow="FREQUENTLY ASKED QUESTIONS"
        title="How Can We Help You?"
        description="Find answers to common questions about discovering, booking and managing food experiences on TasteLocal."
      />

      <section className="info-section">
        <div className="info-container info-faq-container">
          {questions.map((item, index) => (
            <div className="info-faq-item" key={item.question}>
              <button
                type="button"
                className="info-faq-question"
                aria-expanded={activeIndex === index}
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
              >
                <span>{item.question}</span>
                <span className="info-faq-icon">
                  {activeIndex === index ? '−' : '+'}
                </span>
              </button>

              {activeIndex === index && (
                <div className="info-faq-answer">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </InfoLayout>
  );
}

/* =================================
   TERMS & CONDITIONS
================================= */

export function Terms() {
  return (
    <InfoLayout>
      <InfoHero
        eyebrow="LEGAL INFORMATION"
        title="Terms & Conditions"
        description="Please read these terms before using the TasteLocal platform."
      />

      <section className="info-section">
        <div className="info-container info-legal">

          <p className="info-legal-notice">
            Welcome to TasteLocal! These Terms and Conditions govern
            your access to and use of the TasteLocal platform, including
            its website, features and services. TasteLocal is a food
            tourism platform that connects travellers with local food
            experiences, guided food tours, vendors and tour operators.
            By accessing or using our platform, you agree to comply
            with these terms. Please read them carefully before using
            our services.
          </p>

          <h2>1. About TasteLocal</h2>
          <p>
            TasteLocal is a platform that enables users to discover
            local food experiences and food tours offered by
            participating vendors and tour operators.
          </p>

          <h2>2. User Accounts</h2>
          <p>
            Users are responsible for providing accurate
            registration information and maintaining the
            confidentiality of their account credentials.
          </p>

          <h2>3. Booking Requests</h2>
          <p>
            Users may submit booking requests for available food
            experiences and food tours. A submitted request is
            subject to confirmation by the relevant provider.
          </p>

          <h2>4. Vendors and Tour Operators</h2>
          <p>
            Vendors and tour operators are responsible for
            providing accurate listing information, availability,
            prices and descriptions of their offerings.
          </p>

          <h2>5. Reviews and User Content</h2>
          <p>
            Users should submit genuine, relevant and respectful
            reviews. TasteLocal may provide administrative
            functions for managing content on the platform.
          </p>

          <h2>6. Platform Availability</h2>
          <p>
            TasteLocal is provided as an online platform.
            Features and availability may change as the platform
            is updated and improved.
          </p>

          <h2>7. Payments</h2>
          <p>
            Online payment processing is not included in the
            current project version. Users should refer to the
            relevant provider for any arrangements outside
            the platform.
          </p>

          <h2>8. Changes to These Terms</h2>
          <p>
            These terms may be revised as the platform develops.
            Updated terms should be made available to users.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about these terms, please use the
            Contact Us page on the TasteLocal platform.
          </p>

        </div>
      </section>
    </InfoLayout>
  );
}

/* =================================
   PRIVACY POLICY
================================= */

export function Privacy() {
  return (
    <InfoLayout>
      <InfoHero
        eyebrow="YOUR PRIVACY MATTERS"
        title="Privacy Policy"
        description="Understand how information is handled when you use TasteLocal."
      />

      <section className="info-section">
        <div className="info-container info-legal">

          <p className="info-legal-notice">
            At TasteLocal, we value your privacy and are committed
            to protecting your personal information. This Privacy
            Policy explains how we collect, use, store and protect
            information when you access or use our platform. This
            may include information provided when creating an
            account, exploring food experiences, booking food tours,
            submitting reviews or communicating with vendors and
            tour operators. We also explain your rights and choices
            regarding your personal information. By using TasteLocal,
            you acknowledge the practices described in this Privacy Policy.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            TasteLocal may collect account details such as
            usernames, names, email addresses and contact
            information provided during registration.
          </p>

          <h2>2. Profile and Business Information</h2>
          <p>
            Vendors and tour operators may provide business
            details, descriptions, contact information, images
            and location information for their profiles and listings.
          </p>

          <h2>3. Booking Information</h2>
          <p>
            Booking information may include selected food
            experiences or tours, availability sessions,
            booking dates, participant numbers and special requests.
          </p>

          <h2>4. Reviews and Itineraries</h2>
          <p>
            Information submitted through reviews, ratings,
            favourites and itinerary features may be stored
            to provide the platform's functionality.
          </p>

          <h2>5. How Information Is Used</h2>
          <p>
            Information may be used to operate user accounts,
            display listings, process booking requests, support
            platform features and administer the service.
          </p>

          <h2>6. Sharing of Information</h2>
          <p>
            Relevant booking information may be made available
            to the vendor or tour operator responsible for the
            selected listing so that booking requests can be managed.
          </p>

          <h2>7. Data Security</h2>
          <p>
            Appropriate security measures should be maintained
            to protect account and platform information from
            unauthorised access or disclosure.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            Personal information should be retained only as
            necessary for the platform's purposes and applicable
            legal requirements.
          </p>

          <h2>9. Contact</h2>
          <p>
            For privacy-related questions, please contact us
            through the Contact Us page on TasteLocal.
          </p>

        </div>
      </section>
    </InfoLayout>
  );
}

/* =================================
   CONTACT US
================================= */

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend demonstration only.
    // This form does not send messages to Django yet.
    setSubmitted(true);
  };

  return (
    <InfoLayout>
      <InfoHero
        eyebrow="GET IN TOUCH"
        title="We'd Love to Hear From You"
        description="Have a question about TasteLocal? Need help with a booking, food experience or food tour? We're here to help."
      />

      <section className="info-section">
        <div className="info-container contact-layout">

          {/* CONTACT INFORMATION */}

          <div className="contact-information">
            <span className="info-section-label">
              CONTACT TASTELOCAL
            </span>

            <h2>How Can We Help You?</h2>

            <p className="contact-intro">
              Whether you're a traveller exploring local food,
              a vendor showcasing your business or a tour operator
              creating food adventures, we'd love to hear from you.
            </p>

            <InfoCard title="Travellers">
              Need help discovering food experiences or managing bookings?
            </InfoCard>

            <InfoCard title="Local Vendors">
              Need assistance with your business profile or food experiences?
            </InfoCard>

            <InfoCard title="Tour Operators">
              Have questions about creating food tours or managing bookings?
            </InfoCard>

            <div className="contact-help-box">
              <h3>Looking for Quick Answers?</h3>
              <p>
                Visit our Help Centre or browse frequently asked
                questions for more information.
              </p>

              <Link to="/help">Visit Help Centre →</Link>
              <Link to="/faqs">Browse FAQs →</Link>
            </div>
          </div>

          {/* CONTACT FORM */}

          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p>
              Complete the form below and tell us how we can help.
            </p>

            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">✓</div>

                <h3>Thank You for Getting in Touch!</h3>

                <p>
                  Your form has been submitted in this demonstration.
                  No message has been sent to the administrator yet.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      subject: '',
                      message: ''
                    });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="contact-form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Booking Support">Booking Support</option>
                    <option value="Vendor Support">Vendor Support</option>
                    <option value="Tour Operator Support">
                      Tour Operator Support
                    </option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-message">Your Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                >
                  Send Message →
                </button>

              </form>
            )}
          </div>

        </div>
      </section>

      <section className="info-cta">
        <h2>Discover Something Delicious</h2>
        <p>
          Explore local food experiences and guided food tours
          waiting to be discovered.
        </p>

        <div className="info-actions">
          <Link to="/food-experiences" className="info-btn-primary">
            Explore Experiences
          </Link>

          <Link to="/food-tours" className="info-btn-secondary">
            Discover Food Tours
          </Link>
        </div>
      </section>
    </InfoLayout>
  );
}
