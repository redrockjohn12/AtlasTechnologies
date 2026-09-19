"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const client = window.atlasSupabase;
  if (!client) return;

  const state = { leads: [], customers: [], projects: [] };
  const $ = (id) => document.getElementById(id);

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
  const formatDate = (value) => value ? new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(value)) : "—";
  const money = (value) => `R${Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
  const setStatus = (id, message, type = "") => { const el = $(id); if (el) { el.textContent = message; el.className = `form-status ${type}`.trim(); } };
  const toast = (message, type = "") => { const el = $("toast"); el.textContent = message; el.className = `toast show ${type}`.trim(); setTimeout(() => el.classList.remove("show"), 3000); };

  function switchView(view) {
    document.querySelectorAll(".view").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === view));
    document.querySelectorAll(".side-link[data-view]").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-view]").forEach((el) => el.addEventListener("click", () => switchView(el.dataset.view)));
  document.querySelectorAll("[data-jump]").forEach((el) => el.addEventListener("click", () => switchView(el.dataset.jump)));

  async function loadAll() {
    const [leads, customers, projects] = await Promise.all([
      client.from("leads").select("*").order("created_at", { ascending: false }),
      client.from("customers").select("*").order("created_at", { ascending: false }),
      client.from("projects").select("*").order("created_at", { ascending: false })
    ]);
    if (leads.error) throw leads.error;
    if (customers.error) throw customers.error;
    if (projects.error) throw projects.error;
    state.leads = leads.data || [];
    state.customers = customers.data || [];
    state.projects = projects.data || [];
    render();
  }

  function render() {
    $("stat-leads").textContent = state.leads.length;
    $("stat-new-leads").textContent = state.leads.filter((x) => x.status === "new").length;
    $("stat-customers").textContent = state.customers.length;
    $("stat-projects").textContent = state.projects.filter((x) => ["planning", "active", "review"].includes(x.status)).length;
    $("stat-value").textContent = money(state.projects.filter((x) => x.status !== "completed").reduce((sum, x) => sum + Number(x.value || 0), 0));

    const recent = state.leads.slice(0, 6);
    $("recent-leads").innerHTML = recent.length ? recent.map((lead) => `<button class="feed-item" data-open-lead="${lead.id}"><span class="feed-avatar">${escapeHtml((lead.name || "A").slice(0,1).toUpperCase())}</span><span><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.service || "General enquiry")} • ${formatDate(lead.created_at)}</small></span><b>${escapeHtml(lead.status)}</b></button>`).join("") : `<div class="empty">No leads yet. Your website enquiries will appear here.</div>`;

    $("leads-table").innerHTML = state.leads.length ? state.leads.map((lead) => `<tr><td><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.email)}</small></td><td>${escapeHtml(lead.company || "—")}</td><td>${escapeHtml(lead.service || "—")}</td><td><span class="status ${escapeHtml(lead.status)}">${escapeHtml(lead.status)}</span></td><td>${formatDate(lead.created_at)}</td><td class="actions"><button data-edit-lead="${lead.id}">Edit</button><button data-convert-lead="${lead.id}">Convert</button><button class="danger" data-delete-lead="${lead.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="6"><div class="empty">No leads found.</div></td></tr>`;

    $("customer-list").innerHTML = state.customers.length ? state.customers.map((customer) => `<tr><td><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.phone || "")}</small></td><td>${escapeHtml(customer.company || "—")}</td><td>${escapeHtml(customer.email || "—")}</td><td><span class="status ${escapeHtml(customer.status)}">${escapeHtml(customer.status)}</span></td><td>${formatDate(customer.created_at)}</td><td class="actions"><button data-edit-customer="${customer.id}">Edit</button><button class="danger" data-delete-customer="${customer.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="6"><div class="empty">No customers yet.</div></td></tr>`;

    $("project-list").innerHTML = state.projects.length ? state.projects.map((project) => { const c = state.customers.find((x) => x.id === project.customer_id); return `<tr><td><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.service || "")}</small></td><td>${escapeHtml(c?.name || "—")}</td><td><span class="status ${escapeHtml(project.status)}">${escapeHtml(project.status)}</span></td><td>${money(project.value)}</td><td>${formatDate(project.due_date)}</td><td class="actions"><button data-edit-project="${project.id}">Edit</button><button class="danger" data-delete-project="${project.id}">Delete</button></td></tr>`; }).join("") : `<tr><td colspan="6"><div class="empty">No projects yet.</div></td></tr>`;

    $("project-customer").innerHTML = `<option value="">No customer linked</option>` + state.customers.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}${c.company ? ` — ${escapeHtml(c.company)}` : ""}</option>`).join("");

    bindRowActions();
    applySearch("lead-search", "leads-table", [0,1,2,3]);
    applySearch("customer-search", "customer-list", [0,1,2,3]);
    applySearch("project-search", "project-list", [0,1,2,3,4]);
  }

  function applySearch(inputId, tableId, columns) {
    const input = $(inputId);
    const rows = [...$(tableId).querySelectorAll("tr")];
    const query = (input?.value || "").toLowerCase().trim();
    rows.forEach((row) => {
      if (!query) { row.hidden = false; return; }
      const cells = [...row.cells];
      row.hidden = !columns.some((idx) => (cells[idx]?.textContent || "").toLowerCase().includes(query));
    });
  }

  ["lead-search", "customer-search", "project-search"].forEach((id) => $(id)?.addEventListener("input", () => {
    const map = { "lead-search": ["leads-table", [0,1,2,3]], "customer-search": ["customer-list", [0,1,2,3]], "project-search": ["project-list", [0,1,2,3,4]] };
    applySearch(id, map[id][0], map[id][1]);
  }));

  function resetLeadForm() { $("lead-id").value = ""; $("lead-crm-form").reset(); $("lead-form-title").textContent = "Add a lead"; $("lead-cancel").hidden = true; setStatus("lead-status", ""); }
  function resetCustomerForm() { $("customer-id").value = ""; $("customer-form").reset(); $("customer-form-title").textContent = "Add a customer"; $("customer-cancel").hidden = true; setStatus("customer-status-message", ""); }
  function resetProjectForm() { $("project-id").value = ""; $("project-form").reset(); $("project-form-title").textContent = "Add a project"; $("project-cancel").hidden = true; setStatus("project-status-message", ""); }

  $("lead-crm-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = { name: $("crm-lead-name").value.trim(), email: $("crm-lead-email").value.trim(), phone: $("crm-lead-phone").value.trim() || null, company: $("crm-lead-company").value.trim() || null, service: $("crm-lead-service").value, status: $("crm-lead-status").value, subject: $("crm-lead-subject").value.trim() || null, message: $("crm-lead-message").value.trim() || null, source: "crm" };
    const id = $("lead-id").value;
    setStatus("lead-status", "Saving…");
    const result = id ? await client.from("leads").update(payload).eq("id", id) : await client.from("leads").insert(payload);
    if (result.error) { setStatus("lead-status", result.error.message, "error"); return; }
    resetLeadForm(); toast(id ? "Lead updated." : "Lead saved.", "success"); await loadAll();
  });

  $("customer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = { name: $("customer-name").value.trim(), email: $("customer-email").value.trim() || null, phone: $("customer-phone").value.trim() || null, company: $("customer-company").value.trim() || null, status: $("customer-status").value, notes: $("customer-notes").value.trim() || null };
    const id = $("customer-id").value;
    setStatus("customer-status-message", "Saving…");
    const result = id ? await client.from("customers").update(payload).eq("id", id) : await client.from("customers").insert(payload);
    if (result.error) { setStatus("customer-status-message", result.error.message, "error"); return; }
    resetCustomerForm(); toast(id ? "Customer updated." : "Customer saved.", "success"); await loadAll();
  });

  $("project-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = { name: $("project-name").value.trim(), customer_id: $("project-customer").value || null, service: $("project-service").value, status: $("project-status").value, value: Number($("project-value").value || 0), due_date: $("project-due").value || null, notes: $("project-notes").value.trim() || null };
    const id = $("project-id").value;
    setStatus("project-status-message", "Saving…");
    const result = id ? await client.from("projects").update(payload).eq("id", id) : await client.from("projects").insert(payload);
    if (result.error) { setStatus("project-status-message", result.error.message, "error"); return; }
    resetProjectForm(); toast(id ? "Project updated." : "Project saved.", "success"); await loadAll();
  });

  $("lead-cancel").addEventListener("click", resetLeadForm);
  $("customer-cancel").addEventListener("click", resetCustomerForm);
  $("project-cancel").addEventListener("click", resetProjectForm);

  function editLead(id) {
    const lead = state.leads.find((x) => x.id === id); if (!lead) return;
    switchView("leads"); $("lead-id").value = lead.id; $("crm-lead-name").value = lead.name || ""; $("crm-lead-email").value = lead.email || ""; $("crm-lead-phone").value = lead.phone || ""; $("crm-lead-company").value = lead.company || ""; $("crm-lead-service").value = lead.service || "Web Development"; $("crm-lead-status").value = lead.status || "new"; $("crm-lead-subject").value = lead.subject || ""; $("crm-lead-message").value = lead.message || ""; $("lead-form-title").textContent = "Edit lead"; $("lead-cancel").hidden = false; window.scrollTo({top:0,behavior:"smooth"});
  }

  function editCustomer(id) {
    const c = state.customers.find((x) => x.id === id); if (!c) return;
    switchView("customers"); $("customer-id").value = c.id; $("customer-name").value = c.name || ""; $("customer-email").value = c.email || ""; $("customer-phone").value = c.phone || ""; $("customer-company").value = c.company || ""; $("customer-status").value = c.status || "active"; $("customer-notes").value = c.notes || ""; $("customer-form-title").textContent = "Edit customer"; $("customer-cancel").hidden = false; window.scrollTo({top:0,behavior:"smooth"});
  }

  function editProject(id) {
    const p = state.projects.find((x) => x.id === id); if (!p) return;
    switchView("projects"); $("project-id").value = p.id; $("project-name").value = p.name || ""; $("project-customer").value = p.customer_id || ""; $("project-service").value = p.service || "Web Development"; $("project-status").value = p.status || "planning"; $("project-value").value = Number(p.value || 0); $("project-due").value = p.due_date || ""; $("project-notes").value = p.notes || ""; $("project-form-title").textContent = "Edit project"; $("project-cancel").hidden = false; window.scrollTo({top:0,behavior:"smooth"});
  }

  async function deleteRow(table, id, label) {
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return;
    const result = await client.from(table).delete().eq("id", id);
    if (result.error) { toast(result.error.message, "error"); return; }
    toast(`${label[0].toUpperCase()}${label.slice(1)} deleted.`, "success");
    await loadAll();
  }

  async function convertLead(id) {
    const lead = state.leads.find((x) => x.id === id); if (!lead) return;
    const payload = { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: "active", notes: lead.message || null };
    const result = await client.from("customers").insert(payload).select().single();
    if (result.error) { toast(result.error.message, "error"); return; }
    await client.from("leads").update({ status: "won" }).eq("id", id);
    toast("Lead converted to customer.", "success");
    await loadAll();
  }

  function bindRowActions() {
    document.querySelectorAll("[data-edit-lead]").forEach((b) => b.onclick = () => editLead(b.dataset.editLead));
    document.querySelectorAll("[data-delete-lead]").forEach((b) => b.onclick = () => deleteRow("leads", b.dataset.deleteLead, "lead"));
    document.querySelectorAll("[data-convert-lead]").forEach((b) => b.onclick = () => convertLead(b.dataset.convertLead));
    document.querySelectorAll("[data-edit-customer]").forEach((b) => b.onclick = () => editCustomer(b.dataset.editCustomer));
    document.querySelectorAll("[data-delete-customer]").forEach((b) => b.onclick = () => deleteRow("customers", b.dataset.deleteCustomer, "customer"));
    document.querySelectorAll("[data-edit-project]").forEach((b) => b.onclick = () => editProject(b.dataset.editProject));
    document.querySelectorAll("[data-delete-project]").forEach((b) => b.onclick = () => deleteRow("projects", b.dataset.deleteProject, "project"));
    document.querySelectorAll("[data-open-lead]").forEach((b) => b.onclick = () => editLead(b.dataset.openLead));
  }

  try {
    await loadAll();
  } catch (error) {
    console.error(error);
    toast(error.message || "Unable to load CRM data. Run the Supabase schema and check RLS.", "error");
  }
});
