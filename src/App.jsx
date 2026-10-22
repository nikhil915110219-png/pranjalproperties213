import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import Admin from "./Admin.jsx";
function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString("en-IN")}`;
}

function App() {
  const [plots, setPlots] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [plotsError, setPlotsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlots() {
      setLoadingPlots(true);
      setPlotsError("");

      const { data, error } = await supabase
        .from("plots")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setPlotsError(error.message);
        setPlots([]);
      } else {
        const fallbackImage =
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85";

        setPlots((data || []).map((item) => ({
          id: item.plot_code,
          dbId: item.id,
          name: item.name,
          location: item.location || "Location to be confirmed",
          area: item.area_sqft ? `${Number(item.area_sqft).toLocaleString("en-IN")} sq. ft.` : "Area not specified",
          price: Number(item.price || 0),
          status: item.status || "Available",
          image: item.cover_image_url || fallbackImage,
          description: item.description || "Contact our team for verified plot details."
        })));
      }

      setLoadingPlots(false);
    }

    loadPlots();
    return () => { cancelled = true; };
  }, []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryPlot, setEnquiryPlot] = useState("");

  const filteredPlots = useMemo(() => {
    const query = search.trim().toLowerCase();

    return plots.filter((plot) => {
      const matchesSearch = [
        plot.id,
        plot.name,
        plot.location,
        plot.area
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus = status === "All" || plot.status === status;
      return matchesSearch && matchesStatus;
    });
  
}, [plots, search, status]);


  function showEnquiry(plotName = "General enquiry") {
    setEnquiryPlot(plotName);
    setSelectedPlot(null);
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  // Keep all existing hooks above this route check.
  if (window.location.pathname === "/admin") return <Admin />;

  return (
    <div className="website">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Property opportunities, made simpler.</span>
          <span className="topbar-right">
            <span className="live-dot" /> Your property journey starts here
          </span>
        </div>
      </div>

      <header className="header">
        <div className="container nav">
          <a className="brand" href="#home" aria-label="Aurevia home">
            <span className="brand-mark">A</span>
            <span className="brand-copy">
              <strong>AUREVIA</strong>
              <small>PROPERTIES</small>
            </span>
          </a>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#properties" onClick={() => setMenuOpen(false)}>Properties</a>
            <a href="#map" onClick={() => setMenuOpen(false)}>Plot Layout</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>
              Get in touch <span>↗</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image" />
          <div className="hero-shade" />

          <div className="container hero-content">
            <div className="eyebrow hero-eyebrow">
              <span /> FIND YOUR PLACE
            </div>

            <h1>
              A better place
              <br />
              to <em>build your future.</em>
            </h1>

            <p>
              Explore plot opportunities and take the next step toward
              finding land that fits your plans.
            </p>

            <div className="hero-actions">
              <a className="button button-green" href="#properties">
                Explore properties <span>↗</span>
              </a>
              <a className="button button-glass" href="#about">
                Discover Aurevia
              </a>
            </div>

            <div className="hero-note">
              <span className="hero-note-icon">⌖</span>
              <span>
                <strong>Find a plot that feels right</strong>
                <small>Browse listings and enquire with our team</small>
              </span>
            </div>
          </div>

          <div className="hero-index">
            <span>01</span>
            <span className="index-line" />
            <span>LAND & POSSIBILITIES</span>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container trust-grid">
            <div className="trust-item">
              <span className="trust-icon">⌕</span>
              <div><strong>Easy discovery</strong><small>Search available listings</small></div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⌂</span>
              <div><strong>Plot information</strong><small>Explore plot details</small></div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <div><strong>Informed decisions</strong><small>Confirm documents before buying</small></div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">↗</span>
              <div><strong>Personal assistance</strong><small>Connect with our team</small></div>
            </div>
          </div>
        </section>

        <section className="section properties-section" id="properties">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow"><span /> EXPLORE OUR LISTINGS</div>
                <h2>Find land for your <em>next chapter.</em></h2>
                <p>Browse current database listings and open a card to view its details.</p>
              </div>
              <a className="text-link" href="#contact">Need help choosing? ↗</a>
            </div>

            <div className="search-panel">
              <label className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by plot name, code or location..."
                  aria-label="Search plots"
                />
                {search && (
                  <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search">
                    ×
                  </button>
                )}
              </label>

              <label className="filter-box">
                <span>Availability</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option>All</option>
                  <option>Available</option>
                  <option>Reserved</option>
                  <option>Sold</option>
                </select>
              </label>

              <div className="results-count">
                <strong>{filteredPlots.length.toString().padStart(2, "0")}</strong>
                <span>Listings</span>
              </div>
            </div>

            {loadingPlots && <div className="empty-state"><h3>Loading plots...</h3><p>Connecting to the property database.</p></div>}
            {plotsError && <div className="empty-state"><h3>Could not load plots</h3><p>{plotsError}</p><p>Check your Supabase URL, publishable key and table read policy.</p></div>}

            {!loadingPlots && !plotsError && <div className="property-grid">
              {filteredPlots.map((plot) => (
                <article className="property-card" key={plot.id}>
                  <button
                    className="property-image-button"
                    onClick={() => setSelectedPlot(plot)}
                    aria-label={`View ${plot.name}`}
                  >
                    <img src={plot.image} alt={plot.name} loading="lazy" />
                    <span className={`status-pill ${plot.status.toLowerCase()}`}>
                      <span /> {plot.status}
                    </span>
                    <span className="plot-code">{plot.id}</span>
                    <span className="image-arrow">↗</span>
                  </button>

                  <div className="property-body">
                    <div className="property-location"><span>⌖</span> {plot.location}</div>
                    <h3>{plot.name}</h3>
                    <div className="property-meta">
                      <span><b>▦</b> {plot.area}</span>
                      <span><b>⌂</b> Residential</span>
                    </div>
                    <div className="property-footer">
                      <div className="price-block">
                        <small>Indicative price</small>
                        <strong>{formatPrice(plot.price)}</strong>
                      </div>
                      <button
                        className="view-button"
                        onClick={() => setSelectedPlot(plot)}
                        aria-label={`View details for ${plot.name}`}
                      >
                        ↗
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>}

            {!loadingPlots && !plotsError && filteredPlots.length === 0 && (
              <div className="empty-state">
                <span>⌕</span>
                <h3>No matching listings found</h3>
                <p>Try another search term or change the availability filter.</p>
                <button className="button button-green" onClick={() => { setSearch(""); setStatus("All"); }}>
                  Reset filters
                </button>
              </div>
            )}

            <p className="demo-disclaimer">
              Only add verified, client-approved property information to the database before publishing this website.
            </p>
          </div>
        </section>

        <section className="map-section" id="map">
          <div className="container map-layout">
            <div className="map-copy">
              <div className="eyebrow"><span /> PLAN YOUR SEARCH</div>
              <h2>Every plot has a place.<br /><em>Find yours.</em></h2>
              <p>
                Use this layout preview as a starting point for an interactive
                numbered plot map. The real layout and plot positions must be
                added from the approved site plan.
              </p>
              <div className="map-feature"><span>01</span><div><strong>Plot identification</strong><small>Give each plot its own unique code.</small></div></div>
              <div className="map-feature"><span>02</span><div><strong>Clear availability</strong><small>Show available, reserved and sold plots.</small></div></div>
              <a className="button button-green" href="#properties">Browse listings ↗</a>
            </div>

            <div className="map-preview">
              <div className="map-top">
                <div><strong>Site layout preview</strong><small>Illustrative only · Not a survey map</small></div>
                <span className="map-north">N ↑</span>
              </div>
              <div className="map-canvas">
                <div className="map-road road-horizontal"><span>INTERNAL ROAD</span></div>
                <div className="map-road road-vertical" />
                <div className="map-plots">
                  {Array.from({ length: 12 }, (_, index) => {
                    const plotNumber = index + 1;
                    const plotStatus = plotNumber === 4 ? "sold" : plotNumber === 8 ? "reserved" : "available";
                    return (
                      <button
                        key={plotNumber}
                        className={`map-plot ${plotStatus}`}
                        onClick={() => {
                          if (plots.length > 0) {
                            const matchingPlot = plots[(plotNumber - 1) % plots.length];
                            setSelectedPlot(matchingPlot);
                          }
                        }}
                        title={`Open example plot ${plotNumber}`}
                      >
                        <small>P</small>{String(plotNumber).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="map-legend">
                <span><i className="legend-available" /> Available</span>
                <span><i className="legend-reserved" /> Reserved</span>
                <span><i className="legend-sold" /> Sold</span>
              </div>
              <p className="map-disclaimer">Illustration only. Plot positions do not represent an actual property layout.</p>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="about-visual">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85"
                alt="Open green land"
                loading="lazy"
              />
              <div className="about-stamp"><span>A</span><small>AUREVIA<br />PROPERTIES</small></div>
            </div>
            <div className="about-copy">
              <div className="eyebrow"><span /> ABOUT AUREVIA</div>
              <h2>Land is more than space.<br /><em>It's possibility.</em></h2>
              <p>
                AUREVIA PROPERTIES is designed to make exploring plot listings
                clearer and more convenient. Our goal is to present useful
                property information and help visitors connect with the team.
              </p>
              <p>
                Before making a purchase, buyers should independently verify
                ownership, land-use permissions, approvals, measurements,
                access roads and all applicable charges.
              </p>
              <a className="text-link" href="#contact">Talk to our team <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-layout">
            <div className="contact-copy">
              <div className="eyebrow light-eyebrow"><span /> LET'S CONNECT</div>
              <h2>Your next step<br />starts with a <em>conversation.</em></h2>
              <p>Interested in a plot? Send an enquiry and our team can help you with the next steps.</p>
              <div className="contact-detail"><span>⌖</span><div><small>COMPANY LOCATION</small><strong>Add the verified office address</strong></div></div>
              <div className="contact-detail"><span>✉</span><div><small>EMAIL ADDRESS</small><strong>Add the official company email</strong></div></div>
              <div className="contact-detail"><span>☎</span><div><small>PHONE / WHATSAPP</small><strong>Add the official contact number</strong></div></div>
            </div>

            <form className="enquiry-form" onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const subject = encodeURIComponent(`Property enquiry: ${formData.get("plot")}`);
              const body = encodeURIComponent(
                `Name: ${formData.get("name")}\nPhone: ${formData.get("phone")}\nInterested in: ${formData.get("plot")}\nMessage: ${formData.get("message")}`
              );
              window.location.href = `mailto:company@example.com?subject=${subject}&body=${body}`;
            }}>
              <div className="form-heading"><h3>Make an enquiry</h3><p>Fill in your details and continue through your email app.</p></div>
              <label>Your name<input name="name" placeholder="Enter your full name" required /></label>
              <label>Phone number<input name="phone" type="tel" placeholder="Enter your phone number" required /></label>
              <label>Interested plot
                <select name="plot" defaultValue={enquiryPlot || "General enquiry"}>
                  <option>General enquiry</option>
                  {plots.map((plot) => <option key={plot.id}>{`${plot.id} — ${plot.name}`}</option>)}
                </select>
              </label>
              <label>Your message<textarea name="message" placeholder="Tell us what you're looking for..." rows="3" /></label>
              <button className="button button-green form-submit" type="submit">Continue to email <span>↗</span></button>
              <small className="form-note">This demo opens your email application. Replace the example email address before launch.</small>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-main">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">A</span>
            <span className="brand-copy"><strong>AUREVIA</strong><small>PROPERTIES</small></span>
          </a>
          <p>Find your place. Build your future.</p>
          <a href="#home" className="back-top">Back to top ↑</a>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} AUREVIA PROPERTIES</span>
          <span>Property information must be verified independently.</span>
        </div>
      </footer>

      {selectedPlot && (
        <div className="modal-backdrop" onClick={() => setSelectedPlot(null)}>
          <section className="plot-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" onClick={() => setSelectedPlot(null)} aria-label="Close details">×</button>
            <img src={selectedPlot.image} alt={selectedPlot.name} />
            <div className="modal-content">
              <span className={`status-pill ${selectedPlot.status.toLowerCase()}`}><span /> {selectedPlot.status}</span>
              <p className="property-location">{selectedPlot.id} · {selectedPlot.location}</p>
              <h2 id="modal-title">{selectedPlot.name}</h2>
              <p>{selectedPlot.description}</p>
              <div className="modal-facts">
                <div><small>Plot area</small><strong>{selectedPlot.area}</strong></div>
                <div><small>Indicative price</small><strong>{formatPrice(selectedPlot.price)}</strong></div>
              </div>
              <button className="button button-green" onClick={() => showEnquiry(`${selectedPlot.id} — ${selectedPlot.name}`)}>
                Enquire about this plot ↗
              </button>
              <small className="modal-warning">Example listing. Verify all property details before making a decision.</small>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default App;
