// Dynamic Budget Filter Functionality for BudgetEV
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".ev-filter-btn");
    const carCards = document.querySelectorAll(".car-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedCategory = button.getAttribute("data-budget");

            // 1. UI Buttons State Toggle (Active/Inactive Color Switch)
            filterButtons.forEach(btn => {
                if (btn === button) {
                    btn.classList.remove("bg-white", "text-slate-700", "border-slate-200", "hover:bg-slate-50");
                    btn.classList.add("bg-[#0249ad]", "text-white", "shadow-sm");
                } else {
                    btn.classList.remove("bg-[#0249ad]", "text-white", "shadow-sm");
                    btn.classList.add("bg-white", "text-slate-700", "border", "border-slate-200", "hover:bg-slate-50");
                }
            });

            // 2. Filter Cards Logic based on Price Range
            carCards.forEach(card => {
                const price = parseFloat(card.getAttribute("data-price"));
                let shouldShow = false;

                if (selectedCategory === "all") {
                    shouldShow = true;
                } else if (selectedCategory === "under-10l" && price < 10.0) {
                    shouldShow = true;
                } else if (selectedCategory === "10l-15l" && price >= 10.0 && price < 15.0) {
                    shouldShow = true;
                } else if (selectedCategory === "15l-20l" && price >= 15.0 && price <= 20.0) {
                    shouldShow = true;
                } else if (selectedCategory === "above-20l" && price > 20.0) {
                    shouldShow = true;
                }

                // Smooth CSS scale / opacity transition state toggle
                if (shouldShow) {
                    card.style.display = "flex";
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    card.style.display = "none";
                }
            });
        });
    });
});

// ========================================================
// THIRD SECTION CODE: Savings Calculator Button Click Alert
// ========================================================
const calcBtn = document.getElementById("calc-trigger-btn");

if (calcBtn) {
    calcBtn.addEventListener("click", () => {
        // Button click feedback behavior
        calcBtn.style.transform = "scale(0.95)";
        setTimeout(() => {
            calcBtn.style.transform = "scale(1)";
            
            // Founder ke saamne demo ke liye interactive alert window
            alert("Redirecting to Savings Calculator Module... \n[Fuel vs Battery Matrix Dashboard Loading]");
        }, 100);
    });
}

// 3. NEWSLETTER SUBSCRIPTION FORM SUBMIT LOGIC
const newsletterForm = document.getElementById("newsletter-form");
if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Page reload hone se rokne ke liye
        const emailInput = document.getElementById("newsletter-email");
        
        if (emailInput && emailInput.value) {
            alert(`Thank you! \n"${emailInput.value}" has been successfully registered for Indian EV Updates.`);
            emailInput.value = ""; // Input clear karne ke liye
        }
    });
}

// ========================================================
// PAGE SWITCHER & ADVANCED FILTER FUNCTIONALITY
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Page views aur Navigation links ko select karna
    const navHome = document.getElementById("nav-home");
    const navFindEv = document.getElementById("nav-find-ev");
    const homeContent = document.getElementById("main-homepage-content");
    const findEvContent = document.getElementById("advanced-find-ev-page");

    // 1. Navbar Click Logic (Page Switcher)
    if (navFindEv && navHome && homeContent && findEvContent) {
        navFindEv.addEventListener("click", (e) => {
            e.preventDefault();
            // Homepage chhupao, Find EV page dikhao
            homeContent.classList.add("hidden");
            findEvContent.classList.remove("hidden");

            // Navbar links style update (Find EV active dikhe)
            navFindEv.classList.add("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navHome.classList.remove("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navHome.classList.add("hover:text-slate-900");
        });

        navHome.addEventListener("click", (e) => {
            e.preventDefault();
            // Find EV chhupao, Homepage dikhao
            findEvContent.classList.add("hidden");
            homeContent.classList.remove("hidden");

            // Navbar links style update (Home active dikhe)
            navHome.classList.add("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navFindEv.classList.remove("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navFindEv.classList.add("hover:text-slate-900");
        });
    }

    // 2. Sidebar Buttons Click Toggle Logic (SUV, Sedan, Seats)
    const handleToggleGroup = (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            const buttons = container.querySelectorAll("button");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    // Sabse active class hatana
                    buttons.forEach(b => {
                        b.classList.remove("bg-[#0249ad]", "text-white");
                        b.classList.add("bg-white", "text-slate-700", "border", "border-slate-200");
                    });
                    // Selected button ko blue active karna
                    btn.classList.add("bg-[#0249ad]", "text-white");
                    btn.classList.remove("bg-white", "text-slate-700", "border");
                });
            });
        }
    };

    // Dono Button Groups ko toggle-active banana
    handleToggleGroup("body-type-container");
    handleToggleGroup("seating-container");

    // 3. Apply Filters Button Click Event
    const applyBtn = document.getElementById("apply-filters-btn");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            alert("Advanced Filters Applied! \nSorting match-results from Lovable UI Database.");
        });
    }

    // 4. Check Savings Bottom Button Event
    const checkSavingsBtn = document.getElementById("check-savings-btn");
    if (checkSavingsBtn) {
        checkSavingsBtn.addEventListener("click", () => {
            alert("Loading Savings Estimator Tool...");
        });
    }
});

// ========================================================
// PAGE SWITCHER ENGINE (NAVBAR & HERO BLUE BUTTON CLICKS)
// ========================================================

// Sabhi links aur buttons ko select karna (HTML elements se connect karne ke liye)
const navHome = document.getElementById("nav-home");
const navFindEv = document.getElementById("nav-find-ev");
const heroFindBtn = document.getElementById("hero-find-btn"); // Hero section ka blue button

// Dono alag-alag pages ke layouts/containers
const homeContent = document.getElementById("main-homepage-content");
const findEvContent = document.getElementById("advanced-find-ev-page");

// Function 1: Jab user "Find EV" par click kare toh filters wala dashboard open ho
const openAdvancedDashboard = () => {
    if (homeContent && findEvContent) {
        homeContent.classList.add("hidden");        // Purane main home page ko chhupao
        findEvContent.classList.remove("hidden");  // Naye Dashboard UI ko screen par dikhao
        
        // Navbar ke links ka highlight color thik karna
        if (navFindEv && navHome) {
            navFindEv.classList.add("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navHome.classList.remove("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Automatic page ko upar scroll karega
    }
};

// Function 2: Jab user "Home" par click kare toh wapas main homepage dikhne lage
const openHomepage = () => {
    if (homeContent && findEvContent) {
        findEvContent.classList.add("hidden");       // Naye dashboard ko wapas chhupao
        homeContent.classList.remove("hidden");     // Purane homepage ko firse screen par dikhao
        
        // Navbar ke links ka highlight color Home par shift karna
        if (navHome && navFindEv) {
            navHome.classList.add("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
            navFindEv.classList.remove("text-[#1e3a8a]", "border-b-2", "border-[#1e3a8a]", "pb-1");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
    }
};

// Clicks ko links ke saath connect (bind) karna
if (navFindEv) navFindEv.addEventListener("click", (e) => { e.preventDefault(); openAdvancedDashboard(); });
if (heroFindBtn) heroFindBtn.addEventListener("click", (e) => { e.preventDefault(); openAdvancedDashboard(); });
if (navHome) navHome.addEventListener("click", (e) => { e.preventDefault(); openHomepage(); });


// ========================================================
// NEW SIDEBAR FILTERS TOGGLES (SUV / SEDAN / SEATING SELECTION)
// ========================================================
const bindToggleGroup = (containerId) => {
    const targetContainer = document.getElementById(containerId);
    if (targetContainer) {
        const buttons = targetContainer.querySelectorAll("button");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Pehle saare buttons se active blue color hatana aur border lagana
                buttons.forEach(b => {
                    b.classList.remove("bg-[#0249ad]", "text-white");
                    b.classList.add("bg-white", "text-slate-700", "border", "border-slate-200");
                });
                // Jo button click hua hai usko premium blue color dena
                btn.classList.add("bg-[#0249ad]", "text-white");
                btn.classList.remove("bg-white", "text-slate-700", "border");
            });
        });
    }
};

// Dashboard ke Body Type (SUV, Sedan) aur Seating Capacity buttons ko live toggle working banana
bindToggleGroup("body-type-container");
bindToggleGroup("seating-container");

// ========================================================
// REVOLUTIONARY MULTI-PAGE ROUTER (BINA RELOAD NEW UI ENGINE)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Target Elements capture selection
    const navHome = document.getElementById("nav-home");
    const navFindEv = document.getElementById("nav-find-ev");
    const heroFindBtn = document.getElementById("hero-find-btn"); // Blue action button selector

    // 2. Both Layout Wrapper Containers
    const homeContent = document.getElementById("main-homepage-content");
    const findEvContent = document.getElementById("advanced-find-ev-page");

    // Dynamic Function: Click hone par homepage chhupao aur dynamic filter screen open karo
    const openAdvancedDashboard = () => {
        if (homeContent && findEvContent) {
            homeContent.style.display = "none";       // Home structure completely display block clear
            findEvContent.style.display = "block";    // Naye grid list ui ko instant load karo
            findEvContent.classList.remove("hidden"); // Forced visibility filter loader
            
            // Navbar highlight controller states setup
            if (navFindEv && navHome) {
                navFindEv.className = "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 text-[15px] font-semibold transition";
                navHome.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    // Dynamic Function: Home click hone par filters band karke main screen wapas lana
    const openHomepageLayout = () => {
        if (homeContent && findEvContent) {
            findEvContent.style.display = "none";    // Filters screen close look
            homeContent.style.display = "block";     // Main design visibility back
            
            if (navHome && navFindEv) {
                navHome.className = "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 text-[15px] font-semibold transition";
                navFindEv.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    // 3. Connect click interactions dynamically
    if (navFindEv) navFindEv.addEventListener("click", (e) => { e.preventDefault(); openAdvancedDashboard(); });
    if (heroFindBtn) heroFindBtn.addEventListener("click", (e) => { e.preventDefault(); openAdvancedDashboard(); });
    if (navHome) navHome.addEventListener("click", (e) => { e.preventDefault(); openHomepageLayout(); });

    // State lock: Default start window control rules hidden on launch
    if (findEvContent) {
        findEvContent.style.display = "none";
    }

    // Filters Toggles live states control
    const bindFilterGridToggles = (groupId) => {
        const groupContainer = document.getElementById(groupId);
        if (groupContainer) {
            const buttons = groupContainer.querySelectorAll("button");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    buttons.forEach(b => {
                        b.classList.remove("bg-[#0249ad]", "text-white");
                        b.classList.add("bg-white", "text-slate-700", "border", "border-slate-200");
                    });
                    btn.classList.add("bg-[#0249ad]", "text-white");
                    btn.classList.remove("bg-white", "text-slate-700", "border");
                });
            });
        }
    };

    bindFilterGridToggles("body-type-container");
    bindFilterGridToggles("seating-container");
});

// ========================================================
// REVOLUTIONARY COMPARE PAGE SWITCHING LAYER ENGINE 
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Nav links pick selection
    const navHomeLink = document.getElementById("nav-home");
    const navFindEvLink = document.getElementById("nav-find-ev");
    const navCompareLink = document.getElementById("nav-compare"); // Compare Nav Button Identifier

    // Teeno main sections/pages ke boxes
    const homeBox = document.getElementById("main-homepage-content");
    const findEvBox = document.getElementById("advanced-find-ev-page");
    const compareBox = document.getElementById("compare-ev-page"); // Compare dynamic layout page target

    // Main Engine Function: Jo baaki saare screens ko hide karke sirf Compare UI page dikhayega
    const openCompareDashboardUI = () => {
        if (compareBox) {
            // Baaki saare layout containers band karo
            if (homeBox) homeBox.style.display = "none";
            if (findEvBox) findEvBox.style.display = "none";
            
            // Compare section ko active on line show karo
            compareBox.style.display = "block";
            compareBox.classList.remove("hidden");

            // Navbar indicators logic colors highlight fix adjust
            if (navCompareLink && navHomeLink && navFindEvLink) {
                navCompareLink.className = "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 text-[15px] font-semibold transition";
                navHomeLink.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
                navFindEvLink.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    // Jab Compare click ho tab function run karo
    if (navCompareLink) {
        navCompareLink.addEventListener("click", (e) => {
            e.preventDefault();
            openCompareDashboardUI();
        });
    }

    // Jab user Home ya dusre pages par click kare, toh Compare block automatic band ho jana chahiye
    const hideCompareOnOtherClicks = () => {
        if (compareBox) compareBox.style.display = "none";
    };

    if (navHomeLink) navHomeLink.addEventListener("click", hideCompareOnOtherClicks);
    if (navFindEvLink) navFindEvLink.addEventListener("click", hideCompareOnOtherClicks);
    if (document.getElementById("hero-find-btn")) {
        document.getElementById("hero-find-btn").addEventListener("click", hideCompareOnOtherClicks);
    }
});

// ========================================================
// 100% FIXED COMPARE PAGE SWITCHING LAYER (NO OVERLAP FOOTER FIX)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Teeno Links ko select karna
    const navHomeLink = document.getElementById("nav-home");
    const navFindEvLink = document.getElementById("nav-find-ev");
    const navCompareLink = document.getElementById("nav-compare");
    const heroFindBtn = document.getElementById("hero-find-btn");

    // 2. Teeno Main Pages ke Containers
    const homeBox = document.getElementById("main-homepage-content");
    const findEvBox = document.getElementById("advanced-find-ev-page");
    const compareBox = document.getElementById("compare-ev-page");

    // Core Function: Jab Compare open hoga, toh baaki sab kuch hidden hoga aur footer normal ho jayega
    const triggerCompareUI = () => {
        if (compareBox) {
            // Purana sab kuch screen se hide karo taaki footer overlap na kare
            if (homeBox) homeBox.style.display = "none";
            if (findEvBox) findEvBox.style.display = "none";
            
            // Sirf Compare UI ko active display karo
            compareBox.style.display = "block";
            compareBox.classList.remove("hidden");

            // Navbar links ka blue highlight state management
            if (navCompareLink && navHomeLink && navFindEvLink) {
                navCompareLink.className = "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 text-[15px] font-semibold transition";
                navHomeLink.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
                navFindEvLink.className = "hover:text-slate-900 text-[15px] font-medium text-slate-500 transition";
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    // Jab baaki pages khulein, toh Compare wala screen dynamic complete hide hona chahiye
    const clearCompareScreen = () => {
        if (compareBox) {
            compareBox.style.display = "none";
            compareBox.classList.add("hidden");
        }
    };

    // Clicks Binding
    if (navCompareLink) {
        navCompareLink.addEventListener("click", (e) => {
            e.preventDefault();
            triggerCompareUI();
        });
    }

    // Agar Home ya Find EV khule toh compare page band ho jaye aur layout fresh rahe
    if (navHomeLink) navHomeLink.addEventListener("click", clearCompareScreen);
    if (navFindEvLink) navFindEvLink.addEventListener("click", clearCompareScreen);
    if (heroFindBtn) heroFindBtn.addEventListener("click", clearCompareScreen);

    // Default Initial Safety Rule: Pehli baar website khulne par compare section band rahega
    if (compareBox && (!window.location.hash || window.location.hash !== "#compare")) {
        compareBox.style.display = "none";
        compareBox.classList.add("hidden");
    }
});

// ========================================================
// FIXED DYNAMIC INTERACTIVE ROUTER ENGINE
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Nav links elements
    const navHomeLink = document.getElementById("nav-home");
    const navFindEvLink = document.getElementById("nav-find-ev");
    const navCompareLink = document.getElementById("nav-compare");
    const heroFindBtn = document.getElementById("hero-find-btn");

    // Page containers elements
    const homeBox = document.getElementById("main-homepage-content");
    const findEvBox = document.getElementById("advanced-find-ev-page");
    const compareBox = document.getElementById("compare-ev-page");

    // Function jo sabhi sections ko clean hide karega overlap rokne ke liye
    const resetDisplayLayers = () => {
        if (homeBox) homeBox.style.display = "none";
        if (findEvBox) {
            findEvBox.style.display = "none";
            findEvBox.classList.add("hidden");
        }
        if (compareBox) {
            compareBox.style.display = "none";
            compareBox.classList.add("hidden");
        }
    };

    // 1. Jab Navbar ke Compare par click ho (IMAGE 1 DESIGN LOGIC)
    if (navCompareLink) {
        navCompareLink.addEventListener("click", (e) => {
            e.preventDefault();
            resetDisplayLayers(); // Purane open screens hide karo
            
            if (compareBox) {
                compareBox.style.display = "block";
                compareBox.classList.remove("hidden");
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        });
    }

    // 2. Jab Home Link par click ho
    if (navHomeLink) {
        navHomeLink.addEventListener("click", (e) => {
            e.preventDefault();
            resetDisplayLayers();
            if (homeBox) homeBox.style.display = "block";
        });
    }

    // 3. Jab Find EV link click ho
    const triggerFindEVLayout = (e) => {
        if (e) e.preventDefault();
        resetDisplayLayers();
        if (findEvBox) {
            findEvBox.style.display = "block";
            findEvBox.classList.remove("hidden");
        }
    };

    if (navFindEvLink) navFindEvLink.addEventListener("click", triggerFindEVLayout);
    if (heroFindBtn) heroFindBtn.addEventListener("click", triggerFindEVLayout);
});

// ========================================================
// JAVASCRIPT ENGINE FOR INTERACTIVE CAR FINDER WIDGET
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    const primarySelect = document.getElementById("finder-select-primary");
    const secondarySelect = document.getElementById("finder-select-secondary");
    const searchBtn = document.getElementById("finder-search-btn");
    const radioCriteria = document.getElementsByName("search-criteria");

    // A. Radio selection logic (Swaps dynamic values based on criteria selection)
    if (radioCriteria.length > 0) {
        radioCriteria.forEach(radio => {
            radio.addEventListener("change", (e) => {
                if (e.target.value === "brand") {
                    primarySelect.innerHTML = `
                        <option value="all" selected>Select Brand Selection (All Brands)</option>
                        <option value="Tata">Tata Motors</option>
                        <option value="MG">MG Electric</option>
                        <option value="Mahindra">Mahindra EV</option>
                    `;
                } else {
                    primarySelect.innerHTML = `
                        <option value="all" selected>Select Budget Range (All Prices)</option>
                        <option value="under-10">Under ₹10 Lakh</option>
                        <option value="10-15">₹10L - ₹15 Lakh</option>
                        <option value="15-20">₹15L - ₹20 Lakh</option>
                        <option value="above-20">Above ₹20 Lakh</option>
                    `;
                }
            });
        });
    }

    // B. Search Action Engine (Simulates filtering on the grid below seamlessly)
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const primaryVal = primarySelect.value;
            const bodyTypeVal = secondarySelect.value;
            
            // Aapka Discover Section/Budget section ka unique ID yahan target hoga
            const targetSection = document.getElementById("discover-section") || document.getElementById("advanced-find-ev-page");

            // 1. Smooth scroll to the main grid section
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
                // Agar section hidden ho toh use show karein
                targetSection.style.display = "block";
                targetSection.classList.remove("hidden");
            }

            // 2. Automatically triggers the active pills based on budget selection
            const existingPills = document.querySelectorAll("button");
            if (existingPills.length > 0) {
                if (primaryVal === "under-10") {
                    Array.from(existingPills).find(p => p.textContent.includes("Under"))?.click();
                } else if (primaryVal === "10-15") {
                    Array.from(existingPills).find(p => p.textContent.includes("10L"))?.click();
                } else if (primaryVal === "15-20") {
                    Array.from(existingPills).find(p => p.textContent.includes("15L"))?.click();
                } else if (primaryVal === "above-20") {
                    Array.from(existingPills).find(p => p.textContent.includes("Above"))?.click();
                } else {
                    Array.from(existingPills).find(p => p.textContent.includes("All"))?.click();
                }
            }
        });
    }

    // C. Tab Toggle Action (New Car / Used Car)
    const tabNew = document.getElementById("tab-new-car");
    const tabUsed = document.getElementById("tab-used-car");
    if (tabNew && tabUsed) {
        const toggleTabs = (active, inactive) => {
            active.classList.add("bg-slate-900", "text-white");
            active.classList.remove("text-slate-500", "hover:text-slate-800");
            inactive.classList.remove("bg-slate-900", "text-white");
            inactive.classList.add("text-slate-500", "hover:text-slate-800");
        };
        tabNew.addEventListener("click", () => toggleTabs(tabNew, tabUsed));
        tabUsed.addEventListener("click", () => toggleTabs(tabUsed, tabNew));
    }
});

// =====================================================================
// CARDEKHO MULTI-TAB CAR DISPLAY ENGINE MECHANICS LOGIC (BLUE THEME)
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll("#car-category-tabs .tab-btn");
    const container = document.getElementById("dynamic-cars-container");

    // Static Dataset structure mimicking CarDekho Multi-car grid patterns
    const carData = {
        SUV: [
            { name: "Tata Punch EV", price: "₹9.99 - 14.29 Lakh", img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80" },
            { name: "MG Windsor EV", price: "₹13.49 - 18.99 Lakh", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80" },
            { name: "Mahindra XUV400", price: "₹15.49 - 19.39 Lakh", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" },
            { name: "BYD Atto 3", price: "₹24.99 - 33.99 Lakh", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80" }
        ],
        Hatchback: [
            { name: "Tata Tiago EV", price: "₹8.69 - 12.04 Lakh", img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80" },
            { name: "Citroen eC3", price: "₹11.61 - 13.41 Lakh", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80" },
            { name: "MG Comet EV", price: "₹6.99 - 9.65 Lakh", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80" },
            { name: "Tata Altroz EV", price: "₹12.00 - 15.00 Lakh*", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" }
        ],
        Sedan: [
            { name: "Tata Tigor EV", price: "₹12.49 - 13.75 Lakh", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80" },
            { name: "BYD Seal", price: "₹41.00 - 53.00 Lakh", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" },
            { name: "BMW i4 Electric", price: "₹72.50 - 77.50 Lakh", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80" },
            { name: "Audi e-tron GT", price: "₹1.79 - 1.94 Crore", img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80" }
        ],
        Luxury: [
            { name: "Porsche Taycan", price: "₹1.61 - 2.44 Crore", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" },
            { name: "Mercedes EQS", price: "₹1.62 Crore", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80" },
            { name: "BMW iX", price: "₹1.21 Crore", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80" },
            { name: "Jaguar I-Pace", price: "₹1.26 Crore", img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80" }
        ]
    };

    if (tabs.length > 0 && container) {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                // 1. Remove active blue highlights from all standard keys
                tabs.forEach(t => {
                    t.classList.remove("bg-[#0249ad]", "text-white", "shadow-md", "shadow-blue-100");
                    t.classList.add("bg-slate-50", "text-slate-600");
                });

                // 2. Assign deep active theme blue styling to target tab selection
                tab.classList.remove("bg-slate-50", "text-slate-600");
                tab.classList.add("bg-[#0249ad]", "text-white", "shadow-md", "shadow-blue-100");

                // 3. Re-render Grid architecture items smoothly
                const selectedCategory = tab.getAttribute("data-category");
                const cars = carData[selectedCategory] || [];
                
                container.innerHTML = cars.map(car => `
                    <div class="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between opacity-0 translate-y-2 animate-fadeIn inline-block w-full">
                        <div>
                            <div class="w-full h-40 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                                <img src="${car.img}" alt="${car.name}" class="w-full h-full object-cover">
                            </div>
                            <h4 class="text-base font-extrabold text-slate-900 tracking-tight">${car.name}</h4>
                            <p class="text-sm font-black text-[#0249ad] mt-1">${car.price}<span class="text-[10px] font-medium text-slate-400"> *</span></p>
                        </div>
                        <a href="#discover-section" class="w-full mt-5 text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-2.5 rounded-xl transition-all duration-200 block">
                            View June Offers
                        </a>
                    </div>
                `).join('');
            });
        });
    }
});