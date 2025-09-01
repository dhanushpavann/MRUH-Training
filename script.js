document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const addContactBtn = document.getElementById('addContactBtn');
    const modal = document.getElementById('contactModal');
    const closeBtn = document.querySelector('.close-btn');
    const contactForm = document.getElementById('contactForm');
    const contactTableBody = document.querySelector('#contactTable tbody');
    const contactIdInput = document.getElementById('contactId');
    const searchInput = document.getElementById('searchInput');
    const importBtn = document.getElementById('importBtn');
    const csvFileInput = document.getElementById('csvFile');
    const exportBtn = document.getElementById('exportBtn');

    // --- State Management ---
    let contacts = [];
    let currentFilter = '';

    const getContacts = () => {
        const storedContacts = localStorage.getItem('contacts');
        contacts = storedContacts ? JSON.parse(storedContacts) : [];
    };

    const saveContacts = () => {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    };

    // --- UI Rendering ---
    const renderContacts = () => {
        const lowerCaseFilter = currentFilter.toLowerCase();
        const filteredContacts = contacts.filter(contact => {
            return (
                (contact.name && contact.name.toLowerCase().includes(lowerCaseFilter)) ||
                (contact.phone && contact.phone.toLowerCase().includes(lowerCaseFilter)) ||
                (contact.email && contact.email.toLowerCase().includes(lowerCaseFilter)) ||
                (contact.address && contact.address.toLowerCase().includes(lowerCaseFilter))
            );
        });

        contactTableBody.innerHTML = ''; // Clear existing rows
        if (filteredContacts.length === 0) {
            const message = currentFilter ? 'No contacts match your search.' : 'No contacts found. Add one!';
            contactTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${message}</td></tr>`;
            return;
        }

        filteredContacts.forEach(contact => {
            const tr = document.createElement('tr');
            // Basic XSS protection
            const escapeHTML = (str) => (str || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            tr.innerHTML = `
                <td>${escapeHTML(contact.name)}</td>
                <td>${escapeHTML(contact.phone)}</td>
                <td>${escapeHTML(contact.email)}</td>
                <td>${escapeHTML(contact.address)}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${contact.id}">Edit</button>
                    <button class="delete-btn" data-id="${contact.id}">Delete</button>
                </td>
            `;
            contactTableBody.appendChild(tr);
        });
    };

    // --- Modal Handling ---
    const openModal = (contact = null) => {
        contactForm.reset();
        if (contact) {
            document.querySelector('#contactForm h2').textContent = 'Edit Contact';
            contactIdInput.value = contact.id;
            document.getElementById('name').value = contact.name;
            document.getElementById('phone').value = contact.phone;
            document.getElementById('email').value = contact.email;
            document.getElementById('address').value = contact.address;
        } else {
            document.querySelector('#contactForm h2').textContent = 'Add Contact';
            contactIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    // --- Event Handlers ---
    function handleSearch(e) {
        currentFilter = e.target.value;
        renderContacts();
    }

    function handleExport() {
        if (contacts.length === 0) {
            alert('No contacts to export.');
            return;
        }
        const headers = ['name', 'phone', 'email', 'address'];
        const csvRows = [headers.join(',')];

        contacts.forEach(contact => {
            const row = headers.map(header => {
                const value = contact[header] || '';
                return `"${value.replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'contacts.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const lines = text.split(/\r\n|\n/);
            const headers = (lines.shift() || '').split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

            const nameIndex = headers.indexOf('name');
            if (nameIndex === -1) {
                alert('CSV must have a "name" column header.');
                csvFileInput.value = '';
                return;
            }

            const newContacts = lines.map((line, i) => {
                if (line.trim() === '') return null;
                // Regex to handle quoted commas
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                const contactData = {};
                headers.forEach((header, index) => {
                    if (values[index]) {
                        contactData[header] = values[index].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                    }
                });

                return {
                    id: Date.now() + i,
                    name: contactData.name,
                    phone: contactData.phone || '',
                    email: contactData.email || '',
                    address: contactData.address || '',
                };
            }).filter(c => c && c.name); // Filter out nulls and contacts without a name

            if(newContacts.length > 0) {
                contacts.push(...newContacts);
                saveContacts();
                renderContacts();
                alert(`${newContacts.length} contacts imported successfully!`);
            } else {
                alert('No valid contacts found in the file.');
            }
            csvFileInput.value = '';
        };
        reader.readAsText(file);
    }

    // --- Event Listeners ---
    addContactBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    searchInput.addEventListener('input', handleSearch);
    importBtn.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', handleImport);
    exportBtn.addEventListener('click', handleExport);

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = contactIdInput.value;
        const contactData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
        };

        if (!contactData.name) {
            alert('Name is a required field.');
            return;
        }

        if (id) {
            contacts = contacts.map(contact => contact.id.toString() === id ? { ...contact, ...contactData, id: contact.id } : contact);
        } else {
            contactData.id = Date.now();
            contacts.push(contactData);
        }

        saveContacts();
        renderContacts();
        closeModal();
    });

    contactTableBody.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('edit-btn')) {
            const contactToEdit = contacts.find(contact => contact.id.toString() === id);
            if (contactToEdit) openModal(contactToEdit);
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this contact?')) {
                contacts = contacts.filter(contact => contact.id.toString() !== id);
                saveContacts();
                renderContacts();
            }
        }
    });

    // --- Initial Load ---
    const init = () => {
        getContacts();
        renderContacts();
    };

    init();
});
