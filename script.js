"use strict";
const toggle = document.getElementById("menu-toggle"),
  menu = document.getElementById("mobile-menu"),
  icon = document.getElementById("menu-icon");
if (toggle && menu) {
  const open = (o) => {
    menu.hidden = !o;
    toggle.setAttribute("aria-expanded", String(o));
    toggle.setAttribute(
      "aria-label",
      o ? "Close navigation menu" : "Open navigation menu",
    );
    if (icon)
      icon.setAttribute(
        "d",
        o ? "M5 5l14 14M19 5 5 19" : "M4 7h16M4 12h16M4 17h16",
      );
  };
  toggle.addEventListener("click", () =>
    open(toggle.getAttribute("aria-expanded") !== "true"),
  );
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => open(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      open(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) open(false);
  });
  window.matchMedia("(min-width: 1280px)").addEventListener("change", (e) => {
    if (e.matches) open(false);
  });
}
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const teamCarousel = document.querySelector("[data-team-carousel], [data-team-directory]");
if (teamCarousel) {
  const track = teamCarousel.querySelector("[data-team-track]");
  const advisoryTrack = teamCarousel.querySelector("[data-advisory-profiles]");
  const memberTrack = teamCarousel.querySelector("[data-leadership-members]");
  const portfolioTrack = teamCarousel.querySelector("[data-portfolio-leads]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = !("IntersectionObserver" in window);
  let timer;

  function profileElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function profilePhoto(profile) {
    const photo = profileElement("img", "profile-photo");
    photo.src = profile.photo;
    photo.alt = "";
    photo.loading = "lazy";
    return photo;
  }

  const dialog = profileElement("dialog", "profile-dialog");
  dialog.setAttribute("aria-labelledby", "team-profile-title");
  const close = profileElement("button", "mb-4 rounded-full border border-ink/20 px-4 py-2 font-bold hover:bg-mint", "Close profile");
  close.type = "button";
  close.autofocus = true;
  close.addEventListener("click", () => dialog.close());
  const detail = document.createElement("div");
  dialog.append(close, detail);
  teamCarousel.append(dialog);

  function linkedinLink(profile) {
    const link = profileElement("a", "profile-linkedin", "LinkedIn profile");
    link.href = profile.linkedin;
    link.setAttribute("aria-label", "LinkedIn profile for " + profile.name);
    return link;
  }

  function addProfileSection(label, content) {
    detail.append(profileElement("h3", "mt-5 font-display text-lg font-bold", label), content);
  }
  let linkedProfile;
  for (const profile of teamProfiles) {
    const title = profile.name || profile.role;
    const profileId = profile.id ? "profile-" + profile.id : "";
    const card = profileElement("li", "min-h-64 min-w-0 snap-start overflow-hidden rounded-3xl text-white");
    if (advisoryTrack && profileId) card.id = profileId;
    card.style.backgroundColor = "#" + profile.color;
    if (advisoryTrack) card.classList.add(profile.status ? "directory-advisor" : "directory-officer");
    const button = profileElement("button", "profile-card-button hover:bg-white/10");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", "View profile: " + title);
    if (profile.photo) {
      button.append(profilePhoto(profile));
    } else if (profile.name) {
      const initials = profile.name.split(/\s+/).slice(0, 3).map(part => part[0]).join("");
      const monogram = profileElement("div", "profile-monogram", initials);
      monogram.setAttribute("aria-hidden", "true");
      button.append(monogram);
    }
    const content = profileElement("div", "profile-card-text");
    content.append(profileElement("h3", "font-display text-2xl font-black", title));
    const subtitle = profile.name ? profile.role : profile.status;
    if (subtitle) content.append(profileElement("p", "mt-1 font-bold text-white/90", subtitle));
    const summary = profile.summary || profile.responsibilities || profile.bio;
    content.append(profileElement("p", "profile-card-copy mt-3 text-base text-white/90", summary));
    content.append(profileElement("span", "mt-4 inline-block border-b border-white/60 font-bold", "View profile"));
    button.append(content);
    function openProfile() {
      const heading = profileElement("h2", "font-display text-3xl font-black", title);
      heading.id = "team-profile-title";
      detail.replaceChildren(heading);
      if (subtitle) detail.append(profileElement("p", "mt-1 font-bold text-violet", subtitle));
      if (profile.photo) detail.append(profilePhoto(profile));
      if (profile.bio && profile.responsibilities) {
        addProfileSection("About", profileElement("p", "mt-1 leading-7 text-slateink", profile.bio));
      }
      addProfileSection("Role and responsibilities", profileElement("p", "mt-1 leading-7 text-slateink", profile.responsibilities || profile.bio));
      if (advisoryTrack && profile.qualifications?.length) {
        const qualifications = profileElement("ul", "mt-1 list-disc space-y-1 pl-5 text-slateink");
        for (const qualification of profile.qualifications) {
          qualifications.append(profileElement("li", "", qualification));
        }
        addProfileSection("Qualifications and training", qualifications);
      }
      if (advisoryTrack && profile.linkedin) detail.append(linkedinLink(profile));
      if (!advisoryTrack) {
        const link = profileElement("a", "profile-linkedin", "View on the Our Team page");
        link.href = profileId ? "team.html#" + profileId : "team.html#our-team";
        detail.append(link);
      }
      dialog.showModal();
      dialog.scrollTop = 0;
      scheduleTeamScroll();
    }
    button.addEventListener("click", openProfile);
    card.append(button);
    if (advisoryTrack && profile.linkedin) {
      card.classList.add("profile-has-linkedin");
      card.append(linkedinLink(profile));
    }
    if (advisoryTrack && profileId && location.hash === "#" + profileId) linkedProfile = openProfile;
    let destination = track;
    if (advisoryTrack && profile.status) destination = advisoryTrack;
    if (memberTrack && profile.leadershipMember) destination = memberTrack;
    if (portfolioTrack && profile.portfolioLead) destination = portfolioTrack;
    destination.append(card);
  }

  if (linkedProfile) {
    const profileCard = document.getElementById(location.hash.slice(1));
    profileCard.scrollIntoView({ block: "center" });
    linkedProfile();
  }

  function advanceTeamTrack() {
    const maximum = track.scrollWidth - track.clientWidth;
    if (maximum <= 1) return;
    const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
    const atEnd = track.scrollLeft >= maximum - 2;
    track.scrollTo({
      left: atEnd ? 0 : Math.min(maximum, track.scrollLeft + step),
      behavior: atEnd ? "instant" : "smooth",
    });
  }

  function scheduleTeamScroll() {
    window.clearTimeout(timer);
    if (advisoryTrack || !visible || document.hidden || reducedMotion.matches || dialog.open ||
        track.matches(":hover, :focus-within, :active")) return;
    timer = window.setTimeout(() => {
      advanceTeamTrack();
      scheduleTeamScroll();
    }, 1000);
  }

  for (const event of ["pointerenter", "pointerleave", "focusin", "focusout", "touchstart", "touchend", "touchcancel"]) {
    track.addEventListener(event, () => window.requestAnimationFrame(scheduleTeamScroll), { passive: true });
  }
  dialog.addEventListener("close", scheduleTeamScroll);
  reducedMotion.addEventListener("change", scheduleTeamScroll);
  document.addEventListener("visibilitychange", scheduleTeamScroll);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      scheduleTeamScroll();
    }, { threshold: 0.25 });
    observer.observe(track);
  }
  scheduleTeamScroll();
}

// Stretch a single action over its panel while keeping separate actions independent.
for (const panel of document.querySelectorAll("main div[id][class*='rounded-3xl']")) {
  const links = panel.querySelectorAll("a[href]");
  if (links.length === 1 && !panel.querySelector("button, input, select, textarea, details")) {
    panel.classList.add("action-card", "linked-panel");
    links[0].classList.add("panel-link");
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target.matches(".home-page .action-card, .home-page .feature-paths a")) {
        entry.target.classList.toggle("card-in-view", entry.isIntersecting);
        continue;
      }
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("reveal-on-entry");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  for (const item of document.querySelectorAll("main .action-card, main section h2, .feature-paths a, .profile-card-button")) {
    observer.observe(item);
  }
}

const motionToggle = document.querySelector("[data-motion-toggle]");
if (motionToggle && "IntersectionObserver" in window) {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncMotionControl = () => { motionToggle.hidden = motionPreference.matches; };
  syncMotionControl();
  motionPreference.addEventListener("change", syncMotionControl);
  motionToggle.addEventListener("click", () => {
    const paused = document.body.classList.toggle("card-motion-paused");
    motionToggle.textContent = paused ? "Resume card motion" : "Pause card motion";
  });
}

const involvementForm = document.getElementById("involvement-form");
if (involvementForm) {
  const interest = involvementForm.elements.interest;
  const fields = involvementForm.querySelectorAll("[data-interest]");
  const hint = involvementForm.querySelector("[data-involvement-hint]");
  const status = involvementForm.querySelector("[data-involvement-status]");
  const subjects = new Map([
    ["school", "School visit request"],
    ["campus", "Campus partnership proposal"],
    ["volunteer", "Volunteer interest"],
    ["sponsorship", "Partnership or sponsorship inquiry"],
  ]);
  const labels = {
    name: "Name", email: "Email", school: "School", yearGroups: "Year groups",
    institution: "University or college", volunteerArea: "Area of interest", organization: "Organization", details: "Additional details",
  };
  const requested = new URLSearchParams(location.search).get("interest");
  if (subjects.has(requested)) interest.value = requested;

  function updateInterest() {
    for (const group of fields) {
      group.hidden = group.dataset.interest !== interest.value;
      group.disabled = group.hidden;
    }
    hint.hidden = interest.value !== "school";
    hint.textContent = hint.hidden ? "" : "Please use the details of an authorized adult school representative. Leave pupil names and contact information out of the request.";
    status.textContent = "";
  }

  interest.addEventListener("change", updateInterest);
  updateInterest();
  involvementForm.hidden = false;
  involvementForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const subject = subjects.get(interest.value);
    if (!subject) return;
    const lines = [];
    for (const [key, value] of new FormData(involvementForm)) {
      const text = value.trim();
      if (labels[key] && text) lines.push(labels[key] + ": " + text);
    }
    const body = "Hello WiCyS Sierra Leone,\r\n\r\n" + lines.join("\r\n");
    status.textContent = "If your email app opens, review the draft and send it there. You can also use the chapter email below.";
    location.href = "mailto:WiCySSierraLeone@wicys.org?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
}
