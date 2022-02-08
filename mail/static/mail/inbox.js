document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Add event listener to Send button
  document.querySelector('#compose-form').addEventListener('submit',send_mail_view)
}

function send_mail_view() {
  // Fetch data to compose
  fetch('/emails', {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><div id="container"></div>`;
  
  // Fetch data and display it
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => { for (const email of emails) {
    console.log(email);
    const element = document.createElement('div')
    element.innerHTML = 
    (email["read"] ? '<div class="maillist read">' : '<div class="maillist unread">') + 
    `<span><strong>${email["sender"]} </strong> &emsp; ${email["subject"]}
    </span>
    <span>${email["timestamp"]}</span>
    </div>`;
    element.addEventListener('click', function() {
      load_mail(email["id"]);
  });
    document.querySelector('#emails-view').append(element);
  }})
}

function load_mail(email_id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#email-view').innerHTML = "";

  // Add read flag to the email
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  // Fetch data and display it
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(mail => {
    console.log(mail);
    const btn_reply = document.createElement('button')
    btn_reply.innerHTML = "Reply";
    btn_reply.onclick = function() {reply_email(mail.id)}
    document.querySelector('#email-view').append(btn_reply)

    const btn_unread = document.createElement('button')
    btn_unread.innerHTML = "Mark as unread";
    btn_unread.onclick = function() {unread_email(mail.id)}
    document.querySelector('#email-view').append(btn_unread)

    const btn_archive = document.createElement('button')
    if (mail.archived) {btn_archive.innerHTML = "Unarchive";}
    else {btn_archive.innerHTML = "Archive";}
    btn_archive.onclick = function() {archive_mail(mail.id, mail.archived)}
    document.querySelector('#email-view').append(btn_archive)
    
    const element = document.createElement('div');
    element.innerHTML = `</div>
    <div class="mail"><strong>Sender:</strong> &emsp; ${mail.sender}</div>
    <div class="mail"><strong>Recipients:</strong> &emsp; ${mail.recipients}</div>
    <div class="mail"><strong>Subject:</strong> &emsp; ${mail.subject}</div>
    <div class="mail"><strong>Timestamp:</strong> &emsp; ${mail.timestamp}</div>
    <div class="mail"><strong>Body:</strong> &emsp; ${mail.body}</div>`;
    document.querySelector('#email-view').append(element);
  });
}

function unread_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  })
}

function archive_mail(email_id, archived) {
  if (archived) {
    fetch(`/emails/${email_id}`,{
      method: "PUT",
      body: JSON.stringify({
        archived: false
      })
    }).then(load_mail(email_id))
  } else {
    fetch(`/emails/${email_id}`,{
      method: "PUT",
      body: JSON.stringify({
        archived: true
      })
    }).then(load_mail(email_id))
  }
}

function reply_email(email_id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fetch email data
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(mail => {
    document.querySelector('#compose-recipients').value = mail.sender;
    document.querySelector('#compose-subject').value = `RE: ${mail.subject}`;
    document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`
    })

  // Add event listener to Send button
  document.querySelector('#compose-form').addEventListener('submit',send_mail_view)
}