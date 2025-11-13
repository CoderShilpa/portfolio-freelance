// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    
    // --- BACK TO TOP BUTTON FUNCTIONALITY ---
    const backToTopButton = document.querySelector(".back-to-top");
 
    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add("active");
        } else {
            backToTopButton.classList.remove("active");
        }
    });
 
    backToTopButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
 
    // --- SMOOTH SCROLLING FOR NAVIGATION LINKS ---
    const navLinks = document.querySelectorAll("nav a");
 
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
 
            const targetId = this.getAttribute("href");
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Offset by 80px to account for the sticky header height
                window.scrollTo({
                    top: targetSection.offsetTop - 80, 
                    behavior: "smooth",
                });
            }
        });
    });
 
    // ----------------------------------------------------------------------
    // --- CONTACT FORM SUBMISSION HANDLING (UPDATED FOR NODE.JS BACKEND) ---
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById("contactForm");
 
    if (contactForm) {
        // Must be an async function to use 'await' with fetch
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // CRITICAL: Stops the old mailto action
 
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();
            const submitButton = contactForm.querySelector('button[type="submit"]');

            if (!name || !email || !message) {
                alert("Please fill in all fields.");
                return;
            }
            
            // 1. Disable button and show loading state
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                // 2. Send data to the Express backend endpoint (/send-email)
                // The relative path '/' works because the Node.js server hosts the frontend.
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Send data as a JSON string
                    body: JSON.stringify({ name, email, message }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`✅ Success! Thank you for your inquiry, ${name}. I'll get back to you soon.`);
                    contactForm.reset();
                } else {
                    // Handle server errors (e.g., Nodemailer failure)
                    alert(`❌ Failed to send email: ${result.message || 'Server error occurred.'}`);
                }
            } catch (error) {
                console.error('Submission error:', error);
                // Handle network errors (e.g., Node.js server is not running)
                alert('An error occurred. Please ensure your Node.js server is running in the background!');
            } finally {
                // 3. Reset button state, regardless of success or failure
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
 
    // --- TYPING ANIMATION FOR HERO SECTION ---
    const roles = ["Backend Optimization", "Clean Architecture", "Scalable Web Applications"]; 
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const roleElement = document.querySelector(".role");
    const typingSpeed = 100; // Speed in milliseconds
 
    function typeRole() {
        if (!roleElement) return;
 
        const currentRole = roles[roleIndex];
 
        if (isDeleting) {
            // Remove a character
            roleElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // Add a character
            roleElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }
 
        // If word is complete
        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at the end
            isDeleting = true;
            setTimeout(typeRole, 1500);
        }
        // If deletion is complete
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeRole, 500);
        }
        // Continue typing or deleting
        else {
            setTimeout(typeRole, isDeleting ? typingSpeed / 2 : typingSpeed);
        }
    }
 
    // Start the typing animation
    setTimeout(typeRole, 1000);
});