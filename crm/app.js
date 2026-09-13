"use strict";

const STORAGE_KEY = "atlas_crm_customers";

const form = document.getElementById("customer-form");
const list = document.getElementById("customer-list");
const count = document.getElementById("customer-count");

let customers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function renderCustomers() {
    count.textContent = customers.length;

    if (customers.length === 0) {
        list.innerHTML = "<p>No customers yet.</p>";
        return;
    }

    list.innerHTML = customers.map((customer) => `
        <div>
            <strong>${customer.name}</strong><br>
            ${customer.email}<br>
            ${customer.phone || "No phone number"}
        </div>
        <hr>
    `).join("");
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const customer = {
        id: Date.now(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    customers.push(customer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

    form.reset();
    renderCustomers();
});

renderCustomers();

const LEADS_KEY = "atlas_crm_leads";

const leadForm = document.getElementById("lead-form");
const leadList = document.getElementById("lead-list");
const leadCount = document.getElementById("lead-count");

let leads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");

function renderLeads() {
    if (!leadCount || !leadList) return;

    leadCount.textContent = leads.length;

    if (leads.length === 0) {
        leadList.innerHTML = "<p>No leads yet.</p>";
        return;
    }

    leadList.innerHTML = leads.map((lead) => `
        <div class="customer-item">
            <strong>${lead.name}</strong><br>
            ${lead.email}<br>
            ${lead.phone || "No phone number"}<br>
            <strong>Service:</strong> ${lead.service}
        </div>
    `).join("");
}

if (leadForm) {
    leadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const lead = {
            id: Date.now(),
            name: document.getElementById("lead-name").value.trim(),
            email: document.getElementById("lead-email").value.trim(),
            phone: document.getElementById("lead-phone").value.trim(),
            service: document.getElementById("lead-service").value.trim()
        };

        leads.push(lead);
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));

        leadForm.reset();
        renderLeads();
    });
}

renderLeads();

const PROJECTS_KEY = "atlas_crm_projects";

const projectForm = document.getElementById("project-form");
const projectList = document.getElementById("project-list");
const projectCount = document.getElementById("project-count");

let projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");

function renderProjects() {
    if (!projectCount || !projectList) return;

    projectCount.textContent = projects.length;

    if (projects.length === 0) {
        projectList.innerHTML = "<p>No projects yet.</p>";
        return;
    }

    projectList.innerHTML = projects.map((project) => `
        <div class="customer-item">
            <strong>${project.name}</strong><br>
            Client: ${project.client}<br>
            Service: ${project.service}<br>
            Status: <strong>${project.status}</strong>
        </div>
    `).join("");
}

if (projectForm) {
    projectForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const project = {
            id: Date.now(),
            name: document.getElementById("project-name").value.trim(),
            client: document.getElementById("project-client").value.trim(),
            service: document.getElementById("project-service").value.trim(),
            status: document.getElementById("project-status").value
        };

        projects.push(project);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

        projectForm.reset();
        renderProjects();
    });
}

renderProjects();
