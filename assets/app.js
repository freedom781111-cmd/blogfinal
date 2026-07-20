(function () {
  const workItems = [
    {
      title: "Sports coverage",
      category: "Sports",
      location: "Miami / Nationwide",
      eventName: "Field pressure",
      summary: "The body under pressure, stripped of the mythology of victory.",
      position: "58% center",
    },
    {
      title: "Documentary photography",
      category: "Documentary",
      location: "South Florida",
      eventName: "Street record",
      summary: "Stories built from what remains after the official version leaves the room.",
      position: "42% center",
    },
    {
      title: "Editorial assignments",
      category: "Editorial",
      location: "Publications / profiles",
      eventName: "Editorial desk",
      summary: "Images for profiles, essays and visual stories that need more than a clean smile.",
      position: "68% center",
    },
    {
      title: "Portraits",
      category: "Portraits",
      location: "Studio / location",
      eventName: "Portrait sitting",
      summary: "Portraits for people who prefer not to look manufactured by committee.",
      position: "35% center",
    },
    {
      title: "Events and press",
      category: "Events",
      location: "Political / corporate / cultural",
      eventName: "Press access",
      summary: "Coverage that keeps an eye on the room, not only the podium.",
      position: "72% center",
    },
    {
      title: "Licensing and workshops",
      category: "Editorial",
      location: "Archive / education",
      eventName: "Studio desk",
      summary: "Image licensing, editing sessions and workshops on photographic language.",
      position: "50% center",
    },
  ];

  const projects = [
    {
      title: "Desfase, fragmentacion y violencia",
      meta: "2026 / Essay project",
      line: "A project about perception, delay and the violence of the single point of view.",
      note: "Connected to the writing archive already included in this repository.",
    },
    {
      title: "The body under pressure",
      meta: "Sports / Documentary",
      line: "A sustained look at bodies performing under rules, spectacle and exhaustion.",
      note: "A project direction for games, training rooms, sidelines and the seconds after impact.",
    },
    {
      title: "Archive without nostalgia",
      meta: "Editorial / Writing",
      line: "A way of treating the archive as evidence, not as decoration for better lighting.",
      note: "An editorial frame for images, essays, publications and unfinished evidence.",
    },
  ];

  const selectors = {
    body: document.body,
    progress: document.getElementById("scrollProgress"),
    navToggle: document.querySelector(".nav-toggle"),
    siteNav: document.getElementById("siteNav"),
    workGrid: document.getElementById("workGrid"),
    filterButtons: document.querySelectorAll("[data-work-filter]"),
    projectList: document.getElementById("projectList"),
    articleList: document.getElementById("articleList"),
    articleReader: document.getElementById("articleReader"),
    contactForm: document.getElementById("contactForm"),
    formStatus: document.getElementById("formStatus"),
  };

  let activeWorkFilter = "All";
  let activeArticleSlug = "";

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function formatDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function preventLongEventRuns(items) {
    const remaining = [...items];
    const output = [];

    while (remaining.length) {
      const lastThree = output.slice(-3);
      const blockedEvent =
        lastThree.length === 3 &&
        lastThree.every((item) => item.eventName === lastThree[0].eventName)
          ? lastThree[0].eventName
          : null;

      let index = blockedEvent
        ? remaining.findIndex((item) => item.eventName !== blockedEvent)
        : 0;

      if (index < 0) index = 0;
      output.push(remaining.splice(index, 1)[0]);
    }

    return output;
  }

  function renderWork() {
    const filtered = workItems.filter((item) => (
      activeWorkFilter === "All" || item.category === activeWorkFilter
    ));

    const fragment = document.createDocumentFragment();
    preventLongEventRuns(filtered).forEach((item) => {
      const article = createElement("article", "work-card");
      const body = createElement("div", "work-card__body");
      const meta = createElement(
        "p",
        "work-card__meta",
        `${item.category} / ${item.location}`
      );
      const title = createElement("h3", "", item.title);
      const summary = createElement("p", "", item.summary);
      const visual = createElement("div", "work-card__visual");
      visual.style.setProperty("--image-position", item.position);

      body.append(meta, title, summary);
      article.append(body, visual);
      fragment.appendChild(article);
    });

    selectors.workGrid.replaceChildren(fragment);
  }

  function renderProjects() {
    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
      const article = createElement("article", "project-item");
      const number = createElement("small", "", `0${index + 1}`);
      const body = createElement("div");
      const title = createElement("h3", "", project.title);
      const line = createElement("p", "", project.line);
      const note = createElement("p", "project-item__note", project.note);
      const meta = createElement("small", "", project.meta);

      body.append(title, line);
      article.append(number, body, meta, note);
      fragment.appendChild(article);
    });

    selectors.projectList.replaceChildren(fragment);
  }

  function getPosts() {
    const blog = window.DESFASE_BLOG;
    if (!blog || !Array.isArray(blog.posts)) return [];
    return blog.posts.slice(0, 8);
  }

  function renderArticleList() {
    const posts = getPosts();
    if (!posts.length) {
      selectors.articleList.textContent = "";
      selectors.articleReader.textContent = "";
      return;
    }

    if (!activeArticleSlug) {
      activeArticleSlug = posts[0].slug;
    }

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => {
      const button = createElement("button", "article-card");
      button.type = "button";
      button.classList.toggle("is-active", post.slug === activeArticleSlug);
      button.setAttribute("aria-pressed", post.slug === activeArticleSlug ? "true" : "false");

      const meta = createElement(
        "span",
        "article-card__meta",
        `${post.category || "Writing"} / ${post.readingTime || 1} min / ${formatDate(post.date)}`
      );
      const title = createElement("h3", "", post.displayTitle || post.title);
      const excerpt = createElement("p", "", post.excerpt || "");

      button.append(meta, title, excerpt);
      button.addEventListener("click", () => {
        activeArticleSlug = post.slug;
        renderArticleList();
        renderArticleReader();
        selectors.articleReader.focus({ preventScroll: true });
      });
      fragment.appendChild(button);
    });

    selectors.articleList.replaceChildren(fragment);
  }

  function renderArticleReader() {
    const posts = getPosts();
    const post = posts.find((item) => item.slug === activeArticleSlug) || posts[0];
    if (!post) return;

    const meta = createElement(
      "p",
      "article-card__meta",
      `${post.category || "Writing"} / ${post.readingTime || 1} min / ${formatDate(post.date)}`
    );
    const title = createElement("h3", "", post.displayTitle || post.title);
    const excerpt = createElement("p", "", post.excerpt || "");
    const body = createElement("div", "article-reader__body");

    (post.paragraphs || []).slice(0, 10).forEach((paragraph) => {
      body.appendChild(createElement("p", "", paragraph));
    });

    selectors.articleReader.replaceChildren(meta, title, excerpt, body);
  }

  function updateFilterButtons() {
    selectors.filterButtons.forEach((button) => {
      const isActive = button.dataset.workFilter === activeWorkFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function closeNavigation() {
    selectors.body.classList.remove("nav-open");
    selectors.navToggle.setAttribute("aria-expanded", "false");
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    selectors.progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  }

  function encodeMailBody(formData) {
    const lines = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Assignment type: ${formData.get("projectType") || ""}`,
      `Date: ${formData.get("projectDate") || ""}`,
      `Location: ${formData.get("location") || ""}`,
      `Budget: ${formData.get("budget") || ""}`,
      "",
      "Message:",
      formData.get("message") || "",
    ];
    return lines.join("\n");
  }

  async function copyMessage(message) {
    if (!navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (error) {
      return false;
    }
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(selectors.contactForm);
    const message = encodeMailBody(formData);
    const subject = formData.get("projectType")
      ? `Assignment request: ${formData.get("projectType")}`
      : "Assignment request";
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    copyMessage(message).then((copied) => {
      selectors.formStatus.textContent = copied
        ? "Message copied. Your email client will open with the request prepared."
        : "Your email client will open with the request prepared.";
      window.location.href = mailto;
    });
  }

  function bindEvents() {
    selectors.navToggle.addEventListener("click", () => {
      const isOpen = selectors.body.classList.toggle("nav-open");
      selectors.navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    selectors.siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    selectors.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeWorkFilter = button.dataset.workFilter || "All";
        updateFilterButtons();
        renderWork();
      });
    });

    selectors.contactForm.addEventListener("submit", handleContactSubmit);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  bindEvents();
  updateFilterButtons();
  renderWork();
  renderProjects();
  renderArticleList();
  renderArticleReader();
  updateProgress();
})();
