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
