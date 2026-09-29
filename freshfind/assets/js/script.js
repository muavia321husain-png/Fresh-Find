

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const Store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn("Local storage read failed", error);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Local storage write failed", error);
    }
  }
};

const dataCache = new Map();

async function getJSON(file) {
  if (dataCache.has(file)) {
    return dataCache.get(file);
  }

  const response = await fetch(file, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load ${file}: ${response.status}`);
  }

  const data = await response.json();
  dataCache.set(file, data);

  return data;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  let box = $("#myid48");

  if (!box) {
    box = document.createElement("div");
    box.id = "myid48";
    box.className = "toast";
    document.body.appendChild(box);
  }

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2200);
}

function setupImageFallbacks(parent = document) {
  $$("img[data-fallback]", parent).forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = image.dataset.fallback;

      if (fallback && image.src !== new URL(fallback, document.baseURI).href) {
        image.src = fallback;
      }
    }, { once: true });
  });
}

function setupNav() {
  const button = $("#myid1");
  const links = $("#myid2");

  if (button && links) {
    button.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  const hash = (location.hash || "#home").replace("#", "") || "home";

  $$("#myid2 a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const key = href.startsWith("#") ? href.slice(1) : (href.split("#")[0].split("?")[0] || "");
    link.classList.toggle("active", key === hash || key === "spa-" + hash);
    link.classList.toggle("sel", key === hash);
  });

  $$('[data-demo="login"], [data-demo="signup"]').forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = "login";
    });
  });
}

function setupSpa() {
  const views = $$(".spa-view");
  if (!views.length) return;

  function show(name) {
    const key = name || "home";
    views.forEach((view) => {
      const match = view.getAttribute("data-spa") === key || view.id === "spa-" + key;
      view.classList.toggle("spa-active", match);
    });

    $$("#myid2 a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const k = href.startsWith("#") ? href.slice(1) : "";
      link.classList.toggle("sel", k === key);
      link.classList.toggle("active", k === key);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fromHash() {
    const key = (location.hash || "#home").replace("#", "") || "home";
    show(key);
  }

  document.addEventListener("click", (event) => {
    const a = event.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.length < 2) return;
    const key = href.slice(1).split("?")[0];
    if (document.getElementById("spa-" + key)) {
      event.preventDefault();
      if (location.hash !== "#" + key) {
        location.hash = key;
      } else {
        show(key);
      }
    }
  });

  window.addEventListener("hashchange", fromHash);
  fromHash();
}

function setupFooter() {
  const footer = document.querySelector(".foooterofthiswebsite");
  if (!footer) return;

  footer.innerHTML = `
    <div class="mydiv1">
      <div class="gridforfootwer">
        <div>
          <h3>Sitemap</h3>
          <div class="myfootlinks">
            <a href="index.html">Home</a>
            <a href="market.html">Markets</a>
            <a href="produce.html">Produce</a>
            <a href="seasonal.html">Seasonal</a>
          </div>
        </div>
        <div>
          <h3>More pages</h3>
          <div class="myfootlinks">
            <a href="bookmarks.html">Bookmarks</a>
            <a href="about.html">About Us</a>
            <a href="feedback.html">Feedback</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
        <div>
          <h3>Account</h3>
          <div class="myfootlinks">
            <a href="login.html">Sign in</a>
            <a href="login.html">Join</a>
          </div>
        </div>
      </div>
      <div class="html123">© <span id="myid50">${new Date().getFullYear()}</span> FreshFind.</div>
    </div>
  `;
}

function getProduceSeasons(item) {
  if (Array.isArray(item.seasons)) {
    return item.seasons;
  }

  return item.season ? [item.season] : [];
}

function marketBookmarkIds() {
  return Store.get("freshfindMarketBookmarks", []);
}

function produceBookmarkIds() {
  return Store.get("freshfindProduceBookmarks", []);
}

function marketCard(market) {
  const saved = marketBookmarkIds();
  const marked = saved.includes(market.id);

  return `
    <article class="mycard mycard3">
      <div class="myimgwrap">
        <img class="mycardimg" src="${escapeHTML(market.image)}" alt="${escapeHTML(market.name)}" loading="lazy" data-fallback="https://images.pexels.com/photos/3714083/pexels-photo-3714083.jpeg?auto=compress&cs=tinysrgb&w=1000">
        <span class="mybadge">${isMarketOpen(market) ? "Open now" : escapeHTML(market.type)}</span>
      </div>

      <div class="mycardbody">
        <div class="myrow">
          <span class="mytag3">${escapeHTML(market.area)}</span>
          <span class="myrating">★ ${escapeHTML(market.rating)}</span>
        </div>

        <h3>${escapeHTML(market.name)}</h3>
        <p class="mymeta">${escapeHTML(market.distance)} · ${escapeHTML(market.hours)}</p>
        <p class="mysmall mytext2">${escapeHTML(market.description)}</p>

        <div class="mypills">
          ${market.days.slice(0, 3).map((day) => `<span class="mytag3">${escapeHTML(day)}</span>`).join("")}
        </div>

        <div class="myactions myactions2">
          <a class="mybtn mybtn14" href="market.html?id=${encodeURIComponent(market.id)}">View market</a>
          <button class="mybtn mybtn13 mybtn9" type="button" data-id="${escapeHTML(market.id)}">
            ${marked ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function produceCard(item) {
  const seasons = getProduceSeasons(item);
  const saved = produceBookmarkIds();
  const marked = saved.includes(item.id);

  return `
    <article class="mycard mycard4">
      <div class="myimgwrap">
        <img class="mycardimg" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" data-fallback="https://images.pexels.com/photos/12974981/pexels-photo-12974981.jpeg?auto=compress&cs=tinysrgb&w=1000">
        <span class="mybadge">${escapeHTML(item.category)}</span>
      </div>

      <div class="mycardbody">
        <div class="myrow">
          <span class="mytag3">${escapeHTML(seasons[0] || "Seasonal")}</span>
          <span class="myrating">${escapeHTML(item.price)}</span>
        </div>

        <h3>${escapeHTML(item.name)}</h3>
        <p class="mymeta">${seasons.map(escapeHTML).join(" · ")}</p>
        <p class="mysmall mytip">${escapeHTML(item.tip)}</p>

        <div class="myactions myactions2">
          <a class="mybtn mybtn13" href="produce.html?id=${encodeURIComponent(item.id)}">Details</a>
          <button class="mybtn mybtn13 mybtn7" type="button" data-id="${escapeHTML(item.id)}">
            ${marked ? "★ Saved" : "☆ Save"}
          </button>
          <button class="mybtn mybtn14 mybtn-cart" type="button" data-cart-id="${escapeHTML(item.id)}" data-cart-name="${escapeHTML(item.name)}" data-cart-price="${escapeHTML(item.price)}" data-cart-image="${escapeHTML(item.image)}">Add to basket</button>
        </div>
      </div>
    </article>
  `;
}

function bindBookmarks() {
  $$(".mybtn9").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      let saved = marketBookmarkIds();

      if (saved.includes(id)) {
        saved = saved.filter((item) => item !== id);
        button.textContent = "☆ Save";
        toast("Market removed from bookmarks");
      } else {
        saved.push(id);
        button.textContent = "★ Saved";
        toast("Market bookmarked");
      }

      Store.set("freshfindMarketBookmarks", saved);
    });
  });

  $$(".mybtn7").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      let saved = produceBookmarkIds();

      if (saved.includes(id)) {
        saved = saved.filter((item) => item !== id);
        button.textContent = "☆ Save";
        toast("Produce removed from bookmarks");
      } else {
        saved.push(id);
        button.textContent = "★ Saved";
        toast("Produce bookmarked");
      }

      Store.set("freshfindProduceBookmarks", saved);
    });
  });
}



async function initHome() {
  const marketBox = $("#myid17");
  const produceBox = $("#myid38");
  const categoryBox = $("#myid7");

  if (!marketBox && !produceBox && !categoryBox) {
    return;
  }

  try {
    const [markets, produce, categories] = await Promise.all([
      getJSON("assets/data/markets.json"),
      getJSON("assets/data/produce.json"),
      getJSON("assets/data/categories.json")
    ]);

    if (marketBox) {
      marketBox.innerHTML = markets.slice(0, 3).map(marketCard).join("");
      setupImageFallbacks(marketBox);
    }

    if (produceBox) {
      const vegetables = produce.filter((item) => item.category !== "Fruits").slice(0, 6);
      const fruits = produce.filter((item) => item.category === "Fruits").slice(0, 4);
      produceBox.innerHTML = [...vegetables, ...fruits].map(produceCard).join("");
      setupImageFallbacks(produceBox);
    }

    if (categoryBox) {
      categoryBox.innerHTML = categories.map((category) => `
        <a class="mycard mycard2" href="produce.html?category=${encodeURIComponent(category.name)}">
          <img src="${escapeHTML(category.image)}" alt="${escapeHTML(category.name)}" loading="lazy" data-fallback="https://images.pexels.com/photos/12974981/pexels-photo-12974981.jpeg?auto=compress&cs=tinysrgb&w=1000">
          <div class="mytext">
            <h3>${escapeHTML(category.name)}</h3>
            <span>${escapeHTML(category.count)} featured items</span>
          </div>
        </a>
      `).join("");
      setupImageFallbacks(categoryBox);
    }

    bindBookmarks();
  } catch (error) {
    console.error(error);
    showLoadError([marketBox, produceBox, categoryBox]);
  }
}

function showLoadError(boxes) {
  boxes.filter(Boolean).forEach((box) => {
    box.innerHTML = `
      <div class="myempty">
        <h3>Content is waiting to load</h3>
        <p>Open FreshFind through Live Server so the local JSON files can be fetched.</p>
      </div>
    `;
  });
}

function parseTimeRange(value) {
  const parts = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!parts) {
    return null;
  }

  function toMinutes(hour, minute, period) {
    let h = Number(hour) % 12;

    if (period.toUpperCase() === "PM") {
      h += 12;
    }

    return h * 60 + Number(minute);
  }

  return {
    open: toMinutes(parts[1], parts[2], parts[3]),
    close: toMinutes(parts[4], parts[5], parts[6])
  };
}

function isMarketOpen(market, date = new Date()) {
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const schedule = parseTimeRange(market.hours);

  if (!schedule) {
    return false;
  }

  const dayMatches = market.days.includes("Everyday") || market.days.includes(day);
  const minutes = date.getHours() * 60 + date.getMinutes();

  return dayMatches && minutes >= schedule.open && minutes <= schedule.close;
}

function nextOpenIndex(market) {
  const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date().getDay();

  if (market.days.includes("Everyday")) {
    return 0;
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const day = order[(today + offset) % 7];

    if (market.days.includes(day)) {
      return offset;
    }
  }

  return 99;
}

async function initMarkets() {
  const box = $("#myid31");

  if (!box) {
    return;
  }

  try {
    const [markets, produce] = await Promise.all([
      getJSON("assets/data/markets.json"),
      getJSON("assets/data/produce.json")
    ]);

    const search = $("#myid33");
    const area = $("#myid26");
    const day = $("#myid29");
    const produceSelect = $("#myid32");
    const sort = $("#myid34");
    const count = $("#myid28");

    const areas = [...new Set(markets.map((market) => market.area))].sort();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const produceNames = produce.map((item) => item.name).sort();

    area.innerHTML = `<option value="">All areas</option>${areas.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;
    day.innerHTML = `<option value="">Any day</option>${days.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;
    produceSelect.innerHTML = `<option value="">Any produce</option>${produceNames.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;

    const params = new URLSearchParams(location.search);

    if (params.get("search")) {
      search.value = params.get("search");
    }

    if (params.get("area")) {
      area.value = params.get("area");
    }

    if (params.get("day")) {
      day.value = params.get("day");
    }

    if (params.get("produce")) {
      produceSelect.value = params.get("produce");
    }

    function render() {
      const query = search.value.trim().toLowerCase();
      const selectedArea = area.value;
      const selectedDay = day.value;
      const selectedProduce = produceSelect.value;

      let list = markets.filter((market) => {
        const searchable = [
          market.name,
          market.area,
          market.description,
          ...(market.produce || [])
        ].join(" ").toLowerCase();

        const matchesSearch = !query || searchable.includes(query);
        const matchesArea = !selectedArea || market.area === selectedArea;
        const matchesDay = !selectedDay || market.days.includes("Everyday") || market.days.includes(selectedDay);
        const matchesProduce = !selectedProduce || (market.produce || []).includes(selectedProduce);

        return matchesSearch && matchesArea && matchesDay && matchesProduce;
      });

      if (sort) {
        if (sort.value === "name") {
          list.sort((a, b) => a.name.localeCompare(b.name));
        }
        if (sort.value === "rating") {
          list.sort((a, b) => b.rating - a.rating);
        }
        if (sort.value === "distance") {
          list.sort((a, b) => a.distanceKm - b.distanceKm);
        }
        if (sort.value === "nextOpen") {
          list.sort((a, b) => nextOpenIndex(a) - nextOpenIndex(b));
        }
      }

      count.textContent = `${list.length} market${list.length === 1 ? "" : "s"}`;

      box.innerHTML = list.length
        ? list.map(marketCard).join("")
        : `<div class="myempty"><h3>No market found</h3><p>Try another area, day or produce type.</p></div>`;

      bindBookmarks();
      setupImageFallbacks(box);
    }

    [search, area, day, produceSelect, sort].filter(Boolean).forEach((element) => {
      element.addEventListener("input", render);
      element.addEventListener("change", render);
    });

    render();
    window.marketRefresh = render;
  } catch (error) {
    console.error(error);
    showLoadError([box]);
  }
}



function scrollPastBanner() {
  // home pe full banner, baaki pages content pe scroll
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page === "index.html" || page === "" || page === "login.html") {
    return;
  }
  // detail id ho to ye skip
  if (new URLSearchParams(location.search).get("id")) {
    return;
  }
  const banner = document.querySelector(".pagebannerr");
  const mainBlock = document.querySelector("main .section1, main .sectionofthewebsite, main .companyinttro");
  if (!banner || !mainBlock) {
    return;
  }
  requestAnimationFrame(() => {
    setTimeout(() => {
      mainBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  });
}

function hideBannerAndScroll(el) {
  // banner mat hide karo, sirf neeche scroll
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  });
}

function updateBreadcrumb(parts) {
  const box = document.querySelector(".mydiv10, .mydiv11");
  if (!box || !parts || !parts.length) return;

  box.innerHTML = parts
    .map((part, index) => {
      const isLast = index === parts.length - 1;
      if (isLast || !part.href) {
        return `<span>${escapeHTML(part.label)}</span>`;
      }
      return `<a href="${escapeHTML(part.href)}">${escapeHTML(part.label)}</a>`;
    })
    .join('<span class="bcsepp">/</span>');
}

async function initMarketDetail() {
  const detail = $("#myid30");

  if (!detail) {
    return;
  }

  const id = new URLSearchParams(location.search).get("id");

  if (id) {
    const detailSection = detail.closest("section");
    const directorySection = document.querySelector(".section1");
    if (detailSection && directorySection) {
      directorySection.parentNode.insertBefore(detailSection, directorySection);
    }
  }

  if (!id) {
    detail.innerHTML = `
      <div class="myempty marketselectt">
        <div class="marketselecttinner">
          <span class="tag">detail</span>
          <h3>Select a market from the directory</h3>
          <p>click <strong>View market</strong> on a card above. then you can see address, days, map and produce list.</p>
          <div class="pickhintss">
            <span>Map and address</span>
            <span>Days and hours</span>
            <span>Typical produce</span>
            <span>Save for later</span>
          </div>
          <p class="mysmall marketselectthint">use filters first if list is long</p>
        </div>
      </div>
    `;
    updateBreadcrumb([
      { label: "Home", href: "index.html" },
      { label: "Markets" }
    ]);
    return;
  }

  try {
    const [markets, produce] = await Promise.all([
      getJSON("assets/data/markets.json"),
      getJSON("assets/data/produce.json")
    ]);
    const market = markets.find((item) => item.id === id);

    if (!market) {
      throw new Error("Market not found");
    }

    updateBreadcrumb([
      { label: "Home", href: "index.html" },
      { label: "Markets", href: "market.html" },
      { label: market.name }
    ]);

    const mapQuery = encodeURIComponent(market.address);
    const openNow = isMarketOpen(market);
    const saved = marketBookmarkIds().includes(market.id);

    detail.innerHTML = `
      <div>
        <div class="myimg">
          <img src="${escapeHTML(market.image)}" alt="${escapeHTML(market.name)}" data-fallback="https://images.pexels.com/photos/3714083/pexels-photo-3714083.jpeg?auto=compress&cs=tinysrgb&w=1000">
        </div>

        <div class="mymapbox">
          <iframe title="Map for ${escapeHTML(market.name)}" src="https://www.google.com/maps?q=${mapQuery}&output=embed" loading="lazy"></iframe>
        </div>
      </div>

      <div class="mydiv8">
        <span class="mytag3">${escapeHTML(market.type)}</span>
        <h1 class="mytitle">${escapeHTML(market.name)}</h1>
        <p class="mymeta">${escapeHTML(market.area)} · ${escapeHTML(market.distance)} · ★ ${escapeHTML(market.rating)}</p>
        <p class="mytext3">${escapeHTML(market.description)}</p>

        <div class="myinfolist">
          <div class="myinfo"><div><b>Address</b><p class="mysmall">${escapeHTML(market.address)}</p></div></div>
          <div class="myinfo"><div><b>Opening hours</b><p class="mysmall">${escapeHTML(market.hours)}</p></div></div>
          <div class="myinfo"><div><b>Right now</b><p class="mysmall">${openNow ? "Open now" : "Currently closed"}</p></div></div>
          <div class="myinfo"><div><b>Vendors</b><p class="mysmall">${escapeHTML(String(market.vendors || "—"))}</p></div></div>
        </div>

        <div class="myschedule">
          <strong>Market days</strong>
          <div class="mypills">${market.days.map((item) => `<span class="mytag3">${escapeHTML(item)}</span>`).join("")}</div>
        </div>

        <div class="myschedule mybox">
          <strong>Typical produce</strong>
          <div class="mypills">${(market.produce || []).map((item) => {
            const match = produce.find((entry) => entry.name === item);
            const href = match ? `produce.html?id=${encodeURIComponent(match.id)}` : "produce.html";
            return `<a class="mytag3" href="${href}">${escapeHTML(item)}</a>`;
          }).join("")}</div>
        </div>

        <div class="myactions">
          <button class="mybtn mybtn14 mybtn9" type="button" data-id="${escapeHTML(market.id)}">${saved ? "★ Saved" : "☆ Save Market"}</button>
          <a class="mybtn mybtn13" href="market.html">Back to markets</a>
        </div>
      </div>
    `;

    bindBookmarks();
    setupImageFallbacks(detail);
    hideBannerAndScroll(detail);
  } catch (error) {
    console.error(error);
    detail.innerHTML = `<div class="myempty"><h3>Market details could not load</h3><p>Please refresh the page through Live Server.</p></div>`;
  }
}

async function initProduceDetail(data, itemId) {
  const item = data.find((entry) => entry.id === itemId);
  if (!item) {
    return false;
  }

  const box = $("#myid44");
  if (!box) {
    return false;
  }

  const seasons = getProduceSeasons(item);
  box.className = "detail";
  box.innerHTML = `
    <div>
      <div class="myimg">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" data-fallback="https://images.pexels.com/photos/12974981/pexels-photo-12974981.jpeg?auto=compress&cs=tinysrgb&w=1000">
      </div>
    </div>

    <div class="mydiv8">
      <span class="mytag3">${escapeHTML(item.category)}</span>
      <h1 class="mytitle">${escapeHTML(item.name)}</h1>
      <p class="mymeta">${escapeHTML(item.price)} · ${seasons.map(escapeHTML).join(" · ")}</p>
      <p class="mytext3">${escapeHTML(item.benefit)}</p>

      <div class="myinfolist">
        <div class="myinfo"><div><b>Category</b><p class="mysmall">${escapeHTML(item.category)}</p></div></div>
        <div class="myinfo"><div><b>Season</b><p class="mysmall">${escapeHTML(seasons.join(", "))}</p></div></div>
        <div class="myinfo"><div><b>Freshness tip</b><p class="mysmall">${escapeHTML(item.tip)}</p></div></div>
      </div>

      <div class="myactions">
        <button class="mybtn mybtn14 mybtn7" type="button" data-id="${escapeHTML(item.id)}">${produceBookmarkIds().includes(item.id) ? "★ Saved" : "☆ Save Produce"}</button>
        <a class="mybtn mybtn13" href="produce.html">Back to produce</a>
      </div>
    </div>
  `;

  updateBreadcrumb([
    { label: "Home", href: "index.html" },
    { label: "Produce", href: "produce.html" },
    { label: item.name }
  ]);

  bindBookmarks();
  setupImageFallbacks(box);
  hideBannerAndScroll(box);
  return true;
}

async function initProduce() {
  const box = $("#myid44");

  if (!box) {
    return;
  }

  try {
    const data = await getJSON("assets/data/produce.json");
    const search = $("#myid45");
    const category = $("#myid42");
    const season = $("#myid46");
    const count = $("#myid43");

    const categories = [...new Set(data.map((item) => item.category))].sort();
    const seasons = [...new Set(data.flatMap(getProduceSeasons))].sort();

    category.innerHTML = `<option value="">All categories</option>${categories.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;
    season.innerHTML = `<option value="">All seasons</option>${seasons.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;

    const params = new URLSearchParams(location.search);

    if (params.get("id")) {
      await initProduceDetail(data, params.get("id"));
      return;
    }

    if (params.get("category")) {
      category.value = params.get("category");
    }

    if (params.get("search")) {
      search.value = params.get("search");
    }

    if (params.get("season")) {
      season.value = params.get("season");
    }

    function render() {
      const query = search.value.trim().toLowerCase();
      const selectedCategory = category.value;
      const selectedSeason = season.value;

      const list = data.filter((item) => {
        const seasonsForItem = getProduceSeasons(item);
        const searchable = `${item.name} ${item.category} ${item.benefit} ${item.tip}`.toLowerCase();
        const matchesSearch = !query || searchable.includes(query);
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesSeason = !selectedSeason || seasonsForItem.includes(selectedSeason);

        return matchesSearch && matchesCategory && matchesSeason;
      });

      if (count) {
        count.textContent = `${list.length} produce item${list.length === 1 ? "" : "s"}`;
      }

      box.innerHTML = list.length
        ? list.map(produceCard).join("")
        : `<div class="myempty"><h3>No produce found</h3><p>Try another category or season.</p></div>`;

      bindBookmarks();
      setupImageFallbacks(box);
      setupImageFallbacks();
    }

    [search, category, season].forEach((element) => {
      element.addEventListener("input", render);
      element.addEventListener("change", render);
    });

    render();
  } catch (error) {
    console.error(error);
    showLoadError([box]);
  }
}

async function initSeasonal() {
  const box = $("#myid47");

  if (!box) {
    return;
  }

  try {
    const [seasons, produce] = await Promise.all([
      getJSON("assets/data/seasonal.json"),
      getJSON("assets/data/produce.json")
    ]);

    box.innerHTML = seasons.map((season) => {
      const seasonItems = season.items
        .map((name) => produce.find((item) => item.name === name))
        .filter(Boolean);

      return `
        <article class="myseason ${escapeHTML(season.color)}">
          <div class="myseasontop">
            <span class="mytag3">${escapeHTML(season.months)}</span>
          </div>

          <h3>${escapeHTML(season.season)}</h3>
          <p class="mysmall myseasonnote">${escapeHTML(season.note)}</p>

          <div class="myseasongrid">
            ${seasonItems.map((item) => `
              <a class="myseasonphoto" href="produce.html?id=${encodeURIComponent(item.id)}" title="View ${escapeHTML(item.name)}">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" data-fallback="https://images.pexels.com/photos/12974981/pexels-photo-12974981.jpeg?auto=compress&cs=tinysrgb&w=1000">
                <span>${escapeHTML(item.name)}</span>
              </a>
            `).join("")}
          </div>

          <div class="mypills myseasontags">
            ${season.items.map((item) => `<a class="mytag3" href="produce.html?search=${encodeURIComponent(item)}&season=${encodeURIComponent(season.season)}">${escapeHTML(item)}</a>`).join("")}
          </div>

          <a class="myseasonlink" href="produce.html?season=${encodeURIComponent(season.season)}">View all ${escapeHTML(season.season)} picks →</a>
        </article>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    showLoadError([box]);
  }
}

function renderBookmarkNote(itemType, id, savedNotes) {
  const note = savedNotes[`${itemType}:${id}`] || "";

  return `
    <div class="mynote">
      <textarea data-note-type="${itemType}" data-note-id="${escapeHTML(id)}" placeholder="Add a short session note...">${escapeHTML(note)}</textarea>
    </div>
  `;
}

async function initBookmarks() {
  const marketBox = $("#myid6");
  const produceBox = $("#myid41");

  if (!marketBox && !produceBox) {
    return;
  }

  try {
    const [markets, produce] = await Promise.all([
      getJSON("assets/data/markets.json"),
      getJSON("assets/data/produce.json")
    ]);

    const savedMarkets = marketBookmarkIds();
    const savedProduce = produceBookmarkIds();
    const notes = Store.get("freshfindBookmarkNotes", {});

    const marketList = markets.filter((market) => savedMarkets.includes(market.id));
    const produceList = produce.filter((item) => savedProduce.includes(item.id));

    if (marketBox) {
      marketBox.innerHTML = marketList.length
        ? marketList.map((market) => `${marketCard(market).replace("</article>", `${renderBookmarkNote("market", market.id, notes)}</article>`)}`).join("")
        : `<div class="myempty"><h3>No saved markets</h3><p>Save a market from the Markets page and it will appear here.</p></div>`;
    }

    if (produceBox) {
      produceBox.innerHTML = produceList.length
        ? produceList.map((item) => `${produceCard(item).replace("</article>", `${renderBookmarkNote("produce", item.id, notes)}</article>`)}`).join("")
        : `<div class="myempty"><h3>No saved produce</h3><p>Save a produce entry from the Produce page and it will appear here.</p></div>`;
    }

    const marketCount = $("#myid27");
    const produceCount = $("#myid40");

    if (marketCount) marketCount.textContent = marketList.length;
    if (produceCount) produceCount.textContent = produceList.length;

    bindBookmarks();
    bindBookmarkNotes();
    setupImageFallbacks();
    setupBookmarkActions(markets, produce, notes);
  } catch (error) {
    console.error(error);
    showLoadError([marketBox, produceBox]);
  }
}

function bindBookmarkNotes() {
  $$('[data-note-type]').forEach((field) => {
    field.addEventListener("input", () => {
      const notes = Store.get("freshfindBookmarkNotes", {});
      const key = `${field.dataset.noteType}:${field.dataset.noteId}`;
      notes[key] = field.value;
      Store.set("freshfindBookmarkNotes", notes);
    });
  });
}

function setupBookmarkActions(markets, produce, notes) {
  const exportButton = $("#myid16");
  const shareButton = $("#myid5");

  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const savedMarkets = marketBookmarkIds();
      const savedProduce = produceBookmarkIds();
      const lines = ["FreshFind Bookmarks", "", "Markets:"];

      savedMarkets.forEach((id) => {
        const item = markets.find((market) => market.id === id);
        if (item) lines.push(`- ${item.name} (${item.area})`);
      });

      lines.push("", "Produce:");

      savedProduce.forEach((id) => {
        const item = produce.find((entry) => entry.id === id);
        if (item) lines.push(`- ${item.name} (${item.category})`);
      });

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "freshfind-bookmarks.txt";
      link.click();
      URL.revokeObjectURL(url);

      toast("Bookmarks exported");
    });
  }

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const savedMarkets = marketBookmarkIds();
      const first = markets.find((market) => savedMarkets.includes(market.id));
      const text = first
        ? `FreshFind recommendation: ${first.name} in ${first.area}.`
        : "FreshFind helps discover local markets and seasonal produce.";

      if (navigator.share) {
        try {
          await navigator.share({ title: "FreshFind", text, url: location.href });
        } catch (error) {
          console.log("Share cancelled");
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast("Recommendation copied to clipboard");
      } else {
        toast(text);
      }
    });
  }
}

function initContact() {
  const form = $("#myid4") || $("#myid51");

  if (!form) {
    return;
  }

  const nameInput = $("#myid36");

  const markNameInvalid = (invalid) => {
    if (!nameInput) return;
    nameInput.style.borderColor = invalid ? "#d64545" : "";
    nameInput.style.boxShadow = invalid ? "0 0 0 4px rgba(214, 69, 69, 0.12)" : "";
  };

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      markNameInvalid(nameInput.value.includes("."));
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      toast("Please fill in every field before sending.");
      return;
    }

    const name = nameInput ? nameInput.value.trim() : "";

    if (nameInput && name.includes(".")) {
      markNameInvalid(true);
      toast("Please enter a proper name without a dot (.).");
      return;
    }

    if (nameInput) markNameInvalid(false);

    const payload = {
      name,
      email: ($("#myid15") && $("#myid15").value.trim()) || "",
      message: ($("#myid35") && $("#myid35").value.trim()) || "",
      topic: ($("#myid57") && $("#myid57").value) || "",
      rating: ($("#myid58") && $("#myid58").value) || "",
      savedAt: new Date().toISOString()
    };

    const isContact = form.id === "myid51" || form.dataset.form === "contact";
    Store.set(isContact ? "freshfindContact" : "freshfindFeedback", payload);

    form.reset();
    showSuccessModal(
      isContact ? "Message submitted!" : "Feedback submitted!",
      isContact
        ? "Thank you for contacting FreshFind. Your message has been saved locally ."
        : "Thank you for your feedback. It has been saved locally ."
    );
  });
}

function showSuccessModal(title, message) {
  let modal = $("#myid52");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "myid52";
    modal.className = "successmodall";
    modal.innerHTML = `
      <div class="modalboxx">
        <div class="modaliconn">✓</div>
        <h3 id="myid53"></h3>
        <p id="myid54"></p>
        <button class="mybtn mybtn14" type="button" id="myid55">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("open");
      }
    });

    $("#myid55").addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }

  $("#myid53").textContent = title;
  $("#myid54").textContent = message;
  modal.classList.add("open");
}

function setupClock() {
  const footerClock = $("#myid25");
  const navClock = $("#myid37");
  const heroClock = $("#myid20");

  if (!footerClock && !navClock && !heroClock) {
    return;
  }

  function update() {
    const now = new Date();
    const value = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    if (footerClock) footerClock.textContent = value;
    if (navClock) navClock.textContent = value;
    if (heroClock) heroClock.textContent = value;
  }

  update();
  setInterval(update, 1000);
}

function setupGeolocation() {
  const navLocation = $("#myid3");
  const heroLocation = $("#myid19");

  if (!navLocation && !heroLocation) {
    return;
  }

  function update(message) {
    if (navLocation) navLocation.textContent = message;
    if (heroLocation) heroLocation.textContent = message;
  }

  if (!navigator.geolocation) {
    update("Location unavailable");
    return;
  }

  update("Finding your location…");

  navigator.geolocation.getCurrentPosition(
    () => {
      update("Location enabled");

      if (typeof window.marketRefresh === "function") {
        window.marketRefresh();
      }
    },
    () => update("Location permission needed"),
    {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 300000
    }
  );
}

function setupVisitorCounter() {
  const counter = $("#myid49");
  const topCounter = document.querySelector(".topofWebsite .divvvv span:last-child");

  if (!counter && !topCounter) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const saved = Store.get("freshfindVisits", { date: today, count: 0 });
  const count = saved.date === today ? saved.count + 1 : 1;

  Store.set("freshfindVisits", { date: today, count });

  if (counter) counter.textContent = count;
  if (topCounter) topCounter.textContent = `Visitors today: ${count}`;
}

async function setupChatbot() {
  if ($("#myid14")) {
    return;
  }

  let answers;

  try {
    answers = await getJSON("assets/data/chatbot.json");
  } catch (error) {
    console.error(error);
    return;
  }

  const widget = document.createElement("aside");
  widget.id = "myid14";
  widget.className = "mychat";

  widget.innerHTML = `
    <button class="basket-fab" id="basketFab" type="button" aria-label="Open basket">🛒<span class="basket-fab-badge" id="cartBadge">0</span></button>
    <button class="mychatbtn" id="myid11" type="button" aria-label="Open FreshFind assistant">💬</button>

    <div class="mychatpanel" id="myid13" aria-hidden="true">
      <div class="mychathead">
        <div>
          <strong>FreshFind Assistant</strong>
          <span>Static quick-help guide</span>
        </div>
        <button class="mychatclose" id="myid8" type="button" aria-label="Close assistant">×</button>
      </div>

      <div class="mychatmsgs" id="myid12">
        <div class="mychatbubble bot">Hi! Ask me about markets, produce, seasons or bookmarks.</div>
      </div>

      <div class="mychatsuggest">
        ${answers.slice(0, 3).map((item, index) => `<button class="myquestion" type="button" data-index="${index}">${escapeHTML(item.question)}</button>`).join("")}
      </div>

      <form class="mychatform" id="myid9">
        <input id="myid10" type="text" placeholder="Ask FreshFind..." autocomplete="off">
        <button class="mybtn mybtn14" type="submit">Send</button>
      </form>
    </div>
  `;

  document.body.appendChild(widget);

  const basketFab = $("#basketFab");
  if (basketFab) {
    basketFab.addEventListener("click", openCart);
  }
  updateCartBadge();

  const launcher = $("#myid11");
  const panel = $("#myid13");
  const close = $("#myid8");
  const messages = $("#myid12");
  const form = $("#myid9");
  const input = $("#myid10");

  function openChat() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  }

  function closeChat() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = `mychatbubble ${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerQuestion(question) {
    const clean = question.toLowerCase();
    const match = answers.find((item) => {
      const keys = Array.isArray(item.keywords) ? item.keywords : [];
      if (keys.some((keyword) => clean.includes(String(keyword).toLowerCase()))) {
        return true;
      }
      const q = String(item.question || "").toLowerCase();
      return q && clean.includes(q.slice(0, Math.min(12, q.length)));
    });

    return match
      ? match.answer
      : "ask about markets, days, login, or market list.";
  }

  launcher.addEventListener("click", openChat);
  close.addEventListener("click", closeChat);

  $$(".myquestion").forEach((button) => {
    button.addEventListener("click", () => {
      const item = answers[Number(button.dataset.index)];
      addMessage(item.question, "user");
      setTimeout(() => addMessage(item.answer, "bot"), 180);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    addMessage(question, "user");
    input.value = "";

    setTimeout(() => {
      addMessage(answerQuestion(question), "bot");
    }, 180);
  });
}

function cartItems() {
  return Store.get("freshfindCart", []);
}

function saveCart(items) {
  Store.set("freshfindCart", items);
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const items = cartItems();
  const count = items.reduce((sum, item) => sum + (item.qty || 1), 0);
  badge.textContent = String(count);
  if (count > 0) {
    badge.classList.add("show");
  } else {
    badge.classList.remove("show");
  }
}

function addToCart(item) {
  const items = cartItems();
  const existing = items.find((entry) => entry.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    items.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
  }
  saveCart(items);
  renderCartBody();
  openCart();
}

function changeCartQty(id, delta) {
  let items = cartItems();
  const entry = items.find((item) => item.id === id);
  if (!entry) return;
  entry.qty = (entry.qty || 1) + delta;
  if (entry.qty <= 0) {
    items = items.filter((item) => item.id !== id);
  }
  saveCart(items);
  renderCartBody();
}

function removeFromCart(id) {
  const items = cartItems().filter((item) => item.id !== id);
  saveCart(items);
  renderCartBody();
}

function clearCart() {
  saveCart([]);
  renderCartBody();
}

function renderCartBody() {
  const body = document.getElementById("cartDrawerBody");
  const totalEl = document.getElementById("cartTotalValue");
  if (!body) return;

  const items = cartItems();
  if (!items.length) {
    body.innerHTML = '<p class="cart-empty">Your basket is empty. Add produce from the cards.</p>';
    if (totalEl) totalEl.textContent = "0 items";
    return;
  }

  body.innerHTML = items.map((item) => `
    <div class="cart-item">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
      <div class="cart-item-info">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${escapeHTML(item.price)}</span>
      </div>
      <div class="cart-item-qty">
        <button type="button" data-cart-dec="${escapeHTML(item.id)}">−</button>
        <span>${item.qty || 1}</span>
        <button type="button" data-cart-inc="${escapeHTML(item.id)}">+</button>
      </div>
      <button class="cart-item-remove" type="button" data-cart-remove="${escapeHTML(item.id)}">Remove</button>
    </div>
  `).join("");

  const count = items.reduce((sum, item) => sum + (item.qty || 1), 0);
  if (totalEl) totalEl.textContent = count + (count === 1 ? " item" : " items");

  body.querySelectorAll("[data-cart-inc]").forEach((btn) => {
    btn.addEventListener("click", () => changeCartQty(btn.dataset.cartInc, 1));
  });
  body.querySelectorAll("[data-cart-dec]").forEach((btn) => {
    btn.addEventListener("click", () => changeCartQty(btn.dataset.cartDec, -1));
  });
  body.querySelectorAll("[data-cart-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.cartRemove));
  });
}

function openCart() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay) overlay.classList.add("open");
  if (drawer) drawer.classList.add("open");
  renderCartBody();
}

function closeCart() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay) overlay.classList.remove("open");
  if (drawer) drawer.classList.remove("open");
}

function setupCart() {
  if (!document.getElementById("cartDrawer")) {
    const overlay = document.createElement("div");
    overlay.className = "cart-drawer-overlay";
    overlay.id = "cartOverlay";
    document.body.appendChild(overlay);

    const drawer = document.createElement("div");
    drawer.className = "cart-drawer";
    drawer.id = "cartDrawer";
    drawer.innerHTML = `
      <div class="cart-drawer-head">
        <h3>Your basket</h3>
        <button class="cart-close" type="button" id="cartClose" aria-label="Close basket">×</button>
      </div>
      <div class="cart-drawer-body" id="cartDrawerBody"></div>
      <div class="cart-drawer-foot">
        <div class="cart-total"><span>Total</span><span id="cartTotalValue">0 items</span></div>
        <button class="mybtn mybtn14 cart-clear" type="button" id="cartClear">Clear basket</button>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  const closeBtn = document.getElementById("cartClose");
  const overlay = document.getElementById("cartOverlay");
  const clearBtn = document.getElementById("cartClear");

  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  if (clearBtn) clearBtn.addEventListener("click", clearCart);

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".mybtn-cart");
    if (!btn) return;
    addToCart({
      id: btn.dataset.cartId,
      name: btn.dataset.cartName,
      price: btn.dataset.cartPrice,
      image: btn.dataset.cartImage
    });
  });

  renderCartBody();
}

async function boot() {
  setupNav();
  setupSpa();
  setupFooter();
  setupClock();
  setupGeolocation();
  setupVisitorCounter();
  initContact();
  setupImageFallbacks();
  setupCart();

  await Promise.allSettled([
    initHome(),
    initMarkets(),
    initMarketDetail(),
    initProduce(),
    initSeasonal(),
    initBookmarks(),
    setupChatbot()
  ]);

  scrollPastBanner();
}

document.addEventListener("DOMContentLoaded", boot);
