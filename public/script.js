document.addEventListener('DOMContentLoaded', () => {
    const bookButton = document.getElementById('bookAppointmentBtn');
    const cancelButton = document.getElementById('cancelAppointmentBtn');
    const viewButton = document.getElementById('viewAppointmentBtn');
    const formContainer = document.getElementById('formContainer');
    const responseMessage = document.getElementById('responseMessage');
    const patientIdElement = document.getElementById('patientId');
    const tokenNumberElement = document.getElementById('tokenNumber');
    const goHomeBtn = document.getElementById('goHomeBtn');
    const cancelContainer = document.getElementById('cancelContainer');
    const viewContainer = document.getElementById('viewContainer');
    const appointmentDetails = document.getElementById('appointmentDetails');
    const goHomeAfterCancelBtn = document.getElementById('goHomeAfterCancelBtn');
    const goHomeAfterViewBtn = document.getElementById('goHomeAfterViewBtn');
    const mainPage = document.getElementById('mainPage');

    function setMinDateForAppointment() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');  
        const day = String(today.getDate()).padStart(2, '0');
        const minDate = `${year}-${month}-${day}`;

        const dateInput = document.getElementById('DFA');
        if (dateInput) {
            dateInput.setAttribute('min', minDate);
        }
    }
    setMinDateForAppointment();

    function showPage(page) {
        const pages = [mainPage,formContainer, cancelContainer, viewContainer, responseMessage, appointmentDetails];
        pages.forEach(p => p.style.display = 'none');
        page.style.display = 'block';
    }

    function showFormContainer() {
        showPage(formContainer);
        responseMessage.style.display = 'none';
        cancelContainer.style.display = 'none';
        viewContainer.style.display = 'none';
        goHomeBtn.style.display = 'block';
        goHomeAfterCancelBtn.style.display = 'none';
        goHomeAfterViewBtn.style.display = 'none';
        document.getElementById('outpatientForm').style.display = 'block';
    }

    function showCancelContainer() {
        showPage(formContainer);
        responseMessage.style.display = 'none';
        appointmentDetails.style.display = 'none';
        goHomeBtn.style.display = 'none';
        goHomeAfterCancelBtn.style.display = 'block'; 
        goHomeAfterViewBtn.style.display = 'none';
        document.getElementById('outpatientForm').style.display = 'none';
        cancelContainer.style.display = 'block';
    }

    function showViewContainer() {
        showPage(formContainer);
        responseMessage.style.display = 'none';
        cancelContainer.style.display = 'none';
        goHomeBtn.style.display = 'none';
        goHomeAfterCancelBtn.style.display = 'none';
        goHomeAfterViewBtn.style.display = 'block'; 
        appointmentDetails.style.display = 'none';
        document.getElementById('outpatientForm').style.display = 'none';
        viewContainer.style.display = 'block';
    }

    bookButton.addEventListener('click', () => {
        showFormContainer();
        document.getElementById('outpatientForm').reset();
    });

    cancelButton.addEventListener('click', () => {
        showCancelContainer();
        document.getElementById('cancelForm').reset();
    });

    viewButton.addEventListener('click', () => {
        showViewContainer();
        document.getElementById('viewForm').reset();
    });

    document.getElementById('outpatientForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch('/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                patientIdElement.textContent = result._id;
                tokenNumberElement.textContent = result.tokenNumber;
                responseMessage.style.display = 'block';
                goHomeBtn.style.display = 'block';
                document.getElementById('outpatientForm').reset();
            } else {
                alert('Error submitting the form: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form');
        }
    });

    document.getElementById('cancelForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const cancelId = document.getElementById('cancelId').value;
        try {
            const response = await fetch(`/patients/${cancelId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Appointment cancelled successfully');
                goHomeAfterCancelBtn.style.display = 'block';
            } else {
                alert('Error cancelling the appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('There was an error cancelling the appointment');
        }
        document.getElementById('cancelForm').reset();
    });

    document.getElementById('viewForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const viewId = document.getElementById('viewId').value;
        try {
            const response = await fetch(`/patients/${viewId}`);
            const appointment = await response.json();
            if (response.ok) {
                document.getElementById('viewName').textContent = appointment.name;
                document.getElementById('viewGender').textContent = appointment.gender;
                document.getElementById('viewMobile').textContent = appointment.mobileNumber;
                document.getElementById('viewEmail').textContent = appointment.email;
                document.getElementById('viewDate').textContent = appointment.date;
                document.getElementById('viewAge').textContent = appointment.age;
                document.getElementById('viewDisease').textContent = appointment.disease;
                document.getElementById('viewTimeSlot').textContent = appointment.timeSlot; 
                document.getElementById('viewTokenNumber').textContent = appointment.tokenNumber;
                document.getElementById('viewFirstTime').textContent = appointment.firstTime;
                appointmentDetails.style.display = 'block';
                goHomeAfterViewBtn.style.display = 'block';
            } else {
                const message = result.message || 'An unknown error occurred';
                alert('Error retrieving appointment details: ' + message);
                appointmentDetails.style.display = 'none';
            }
        } catch (error) {
            console.error('Error retrieving appointment details:', error);
            alert('There was an error retrieving appointment details');
            appointmentDetails.style.display = 'none';
        }
        document.getElementById('viewForm').reset();
    });
    function showMainPage(){
        showPage(mainPage);
    }
    goHomeBtn.addEventListener('click', showMainPage);
    goHomeAfterCancelBtn.addEventListener('click', showMainPage);
    goHomeAfterViewBtn.addEventListener('click', showMainPage);
});
