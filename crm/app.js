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

const NOTES_KEY = "atlas_crm_notes";

const noteForm = document.getElementById("note-form");
const noteList = document.getElementById("note-list");

let notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");

function renderNotes() {
    if (!noteList) return;

    if (notes.length === 0) {
        noteList.innerHTML = "<p>No notes yet.</p>";
        return;
    }

    noteList.innerHTML = notes.map((note) => `
        <div class="customer-item">
            <strong>${note.customer}</strong><br>
            <p>${note.text}</p>
            <small>${new Date(note.createdAt).toLocaleString()}</small>
        </div>
    `).join("");
}

if (noteForm) {
    noteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const note = {
            id: Date.now(),
            customer: document.getElementById("note-customer").value.trim(),
            text: document.getElementById("note-text").value.trim(),
            createdAt: new Date().toISOString()
        };

        notes.unshift(note);
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

        noteForm.reset();
        renderNotes();
    });
}

renderNotes();

const QUOTES_KEY = "atlas_crm_quotes";

const quoteForm = document.getElementById("quote-form");
const quoteList = document.getElementById("quote-list");
const quoteCount = document.getElementById("quote-count");

let quotes = JSON.parse(localStorage.getItem(QUOTES_KEY) || "[]");

function renderQuotes() {
    if (!quoteCount || !quoteList) return;

    quoteCount.textContent = quotes.length;

    if (quotes.length === 0) {
        quoteList.innerHTML = "<p>No quotes yet.</p>";
        return;
    }

    quoteList.innerHTML = quotes.map((quote) => `
        <div class="customer-item">
            <strong>${quote.client}</strong><br>
            Service: ${quote.service}<br>
            Amount: SZL ${Number(quote.amount).toFixed(2)}<br>
            Status: <strong>${quote.status}</strong>
        </div>
    `).join("");
}

if (quoteForm) {
    quoteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const quote = {
            id: Date.now(),
            client: document.getElementById("quote-client").value.trim(),
            service: document.getElementById("quote-service").value.trim(),
            amount: document.getElementById("quote-amount").value,
            status: document.getElementById("quote-status").value
        };

        quotes.push(quote);
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));

        quoteForm.reset();
        renderQuotes();
    });
}

renderQuotes();

const INVOICES_KEY = "atlas_crm_invoices";

const invoiceForm = document.getElementById("invoice-form");
const invoiceList = document.getElementById("invoice-list");
const invoiceCount = document.getElementById("invoice-count");

let invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || "[]");

function renderInvoices() {
    if (!invoiceCount || !invoiceList) return;

    invoiceCount.textContent = invoices.length;

    if (invoices.length === 0) {
        invoiceList.innerHTML = "<p>No invoices yet.</p>";
        return;
    }

    invoiceList.innerHTML = invoices.map((invoice) => `
        <div class="customer-item">
            <strong>${invoice.number}</strong><br>
            Client: ${invoice.client}<br>
            Service: ${invoice.service}<br>
            Amount: SZL ${Number(invoice.amount).toFixed(2)}<br>
            Status: <strong>${invoice.status}</strong>
        </div>
    `).join("");
}

if (invoiceForm) {
    invoiceForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const invoice = {
            id: Date.now(),
            number: document.getElementById("invoice-number").value.trim(),
            client: document.getElementById("invoice-client").value.trim(),
            service: document.getElementById("invoice-service").value.trim(),
            amount: document.getElementById("invoice-amount").value,
            status: document.getElementById("invoice-status").value
        };

        invoices.push(invoice);
        localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));

        invoiceForm.reset();
        renderInvoices();
    });
}

renderInvoices();
