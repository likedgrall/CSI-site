const modal = document.querySelector("#request-modal");
const requestForms = document.querySelectorAll(".js-request-form");
const openButtons = document.querySelectorAll("[data-open-request]");
const closeButtons = document.querySelectorAll("[data-close-request]");
const phoneInputs = document.querySelectorAll('input[type="tel"]');
const fileInputs = document.querySelectorAll('input[type="file"]');
const fileClearButtons = document.querySelectorAll(".file-upload__clear");
const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhksRp0PeteXBvEX-6Tp_9nljkvmZ5es1zmMyF4QC2yxtUrXjxohj2RRUZpqpxwOXyPw/exec";
const FORM_STUB_MODE = false;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_FILE_NAME_LENGTH = 38;
const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"];
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
];

const openModal = () => {
    if (!modal) {
        return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");

    const firstField = modal.querySelector("input");

    if (firstField) {
        firstField.focus();
    }
};

const closeModal = () => {
    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
};

const isMenuOpen = () => nav?.classList.contains("is-open");

const openMenu = () => {
    if (!nav || !menuToggle) {
        return;
    }

    nav.classList.add("is-open");
    menuToggle.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("is-locked");
};

const closeMenu = () => {
    if (!nav || !menuToggle) {
        return;
    }

    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("is-locked");
};

menuToggle?.addEventListener("click", () => {
    if (isMenuOpen()) {
        closeMenu();
        return;
    }

    openMenu();
});

openButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.closest(".nav") && isMenuOpen()) {
            closeMenu();
            window.setTimeout(openModal, 280);
            return;
        }

        openModal();
    });
});

nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
        if (isMenuOpen()) {
            closeMenu();
        }
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 850 && isMenuOpen()) {
        closeMenu();
    }
});

closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    if (isMenuOpen()) {
        closeMenu();
        return;
    }

    if (modal?.classList.contains("is-open")) {
        closeModal();
    }
});

const getDigits = (value) => value.replace(/\D/g, "");

const formatRussianPhone = (value) => {
    let digits = getDigits(value);

    if (digits.startsWith("8")) {
        digits = `7${digits.slice(1)}`;
    }

    if (!digits.startsWith("7")) {
        digits = `7${digits}`;
    }

    digits = digits.slice(0, 11);

    const code = digits.slice(1, 4);
    const first = digits.slice(4, 7);
    const second = digits.slice(7, 9);
    const third = digits.slice(9, 11);

    let formatted = "+7";

    if (code) {
        formatted += ` ${code}`;
    }

    if (first) {
        formatted += `-${first}`;
    }

    if (second) {
        formatted += `-${second}`;
    }

    if (third) {
        formatted += `-${third}`;
    }

    return formatted;
};

const formatInternationalPhone = (value) => {
    let digits = getDigits(value);

    if (!digits) {
        return "";
    }

    if (digits.startsWith("8")) {
        digits = `7${digits.slice(1)}`;
    }

    if (digits.startsWith("7")) {
        return formatRussianPhone(digits);
    }

    const phoneLibrary = window.libphonenumber || window.libphonenumberJs || window.libphonenumberjs;

    if (phoneLibrary?.AsYouType) {
        const formatter = new phoneLibrary.AsYouType();
        return formatter.input(`+${digits}`);
    }

    return `+${digits}`;
};

phoneInputs.forEach((input) => {
    input.addEventListener("focus", () => {
        if (!input.value.trim()) {
            input.value = "+7";
        }
    });

    input.addEventListener("keydown", (event) => {
        const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
        ];

        if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
            return;
        }

        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    });

    input.addEventListener("input", () => {
        input.value = formatInternationalPhone(input.value);
        input.setSelectionRange(input.value.length, input.value.length);
    });
});

const resetFileUpload = (input) => {
    const upload = input.closest(".file-upload");
    const button = upload?.querySelector(".file-upload__button");
    const name = upload?.querySelector(".file-upload__name");

    upload?.classList.remove("is-selected");

    if (button) {
        button.textContent = "Выбрать файл";
    }

    if (name) {
        name.textContent = "Файл не выбран";
        name.removeAttribute("title");
    }
};

const updateFileUpload = (input) => {
    const upload = input.closest(".file-upload");
    const button = upload?.querySelector(".file-upload__button");
    const name = upload?.querySelector(".file-upload__name");
    const file = input.files?.[0];

    if (!file) {
        resetFileUpload(input);
        return;
    }

    upload?.classList.add("is-selected");

    if (button) {
        button.textContent = "Выбрать другой файл";
    }

    if (name) {
        name.textContent = shortenFileName(file.name);
        name.title = file.name;
    }
};

const shortenFileName = (fileName) => {
    if (fileName.length <= MAX_FILE_NAME_LENGTH) {
        return fileName;
    }

    const extensionIndex = fileName.lastIndexOf(".");
    const extension = extensionIndex > -1 ? fileName.slice(extensionIndex) : "";
    const baseName = extensionIndex > -1 ? fileName.slice(0, extensionIndex) : fileName;
    const availableLength = MAX_FILE_NAME_LENGTH - extension.length - 3;

    if (availableLength <= 0) {
        return `${fileName.slice(0, MAX_FILE_NAME_LENGTH - 3)}...`;
    }

    return `${baseName.slice(0, availableLength)}...${extension}`;
};

fileInputs.forEach((input) => {
    input.addEventListener("change", () => {
        const file = input.files?.[0];
        const form = input.closest(".js-request-form");

        if (file && file.size > MAX_FILE_SIZE) {
            input.value = "";
            resetFileUpload(input);
            setFormStatus(form, "Файл слишком большой. Прикрепите файл до 8 МБ.", "error");
            return;
        }

        if (file && !isAllowedFile(file)) {
            input.value = "";
            resetFileUpload(input);
            setFormStatus(form, "Недопустимый формат файла. Разрешены PDF, DOC, DOCX, XLS, XLSX, JPG и PNG.", "error");
            return;
        }

        if (form) {
            setFormStatus(form, "");
        }

        updateFileUpload(input);
    });
});

fileClearButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const upload = button.closest(".file-upload");
        const input = upload?.querySelector('input[type="file"]');
        const form = button.closest(".js-request-form");

        if (input) {
            input.value = "";
            resetFileUpload(input);
        }

        if (form) {
            setFormStatus(form, "");
        }
    });
});

const setFormStatus = (form, message, type = "success") => {
    if (!form) {
        return;
    }

    const statusMessage = form.querySelector(".form__status");

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;

        resolve({
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            content: base64,
        });
    });

    reader.addEventListener("error", () => {
        reject(new Error("File read failed"));
    });

    reader.readAsDataURL(file);
});

const getFileExtension = (fileName) => {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
};

const isAllowedFile = (file) => {
    const extension = getFileExtension(file.name);
    const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.includes(extension);
    const hasAllowedType = !file.type || ALLOWED_FILE_TYPES.includes(file.type);

    return hasAllowedExtension && hasAllowedType;
};

requestForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const honeypot = String(formData.get("company") || "").trim();
        const fileInput = form.querySelector('input[type="file"]');
        const file = fileInput?.files?.[0] || null;

        if (honeypot) {
            form.reset();
            form.querySelectorAll('input[type="file"]').forEach(resetFileUpload);
            return;
        }

        if (file && file.size > MAX_FILE_SIZE) {
            if (fileInput) {
                fileInput.value = "";
                resetFileUpload(fileInput);
            }

            setFormStatus(form, "Файл слишком большой. Прикрепите файл до 8 МБ.", "error");
            return;
        }

        if (file && !isAllowedFile(file)) {
            if (fileInput) {
                fileInput.value = "";
                resetFileUpload(fileInput);
            }

            setFormStatus(form, "Недопустимый формат файла. Разрешены PDF, DOC, DOCX, XLS, XLSX, JPG и PNG.", "error");
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const payload = {
            name: String(formData.get("name") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            message: String(formData.get("message") || "").trim(),
            attachment: null,
        };

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Отправляем...";
        }

        setFormStatus(form, "");

        try {
            if (file) {
                payload.attachment = await readFileAsBase64(file);
            }

            if (FORM_STUB_MODE) {
                await new Promise((resolve) => {
                    window.setTimeout(resolve, 500);
                });

                form.reset();
                form.querySelectorAll('input[type="file"]').forEach(resetFileUpload);
                setFormStatus(form, "Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
                return;
            }

            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const result = await response.json();

            if (!result.ok) {
                throw new Error("Request failed");
            }

            form.reset();
            form.querySelectorAll('input[type="file"]').forEach(resetFileUpload);
            setFormStatus(form, "Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
        } catch (error) {
            setFormStatus(form, "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.", "error");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Отправить заявку";
            }
        }
    });
});
