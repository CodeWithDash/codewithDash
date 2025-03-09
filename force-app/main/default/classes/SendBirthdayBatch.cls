public without sharing class SendBirthdayBatch implements Database.Batchable<sObject>{
    public list<string> eventMessages = new list<string>();
    public Database.QueryLocator start(Database.BatchableContext bc){
        return Database.getQueryLocator('SELECT id,name,Birthdate,Email from Contact where Birthdate=TODAY');
    }
    public void execute(Database.BatchableContext bc,list<Contact> myContacts){
        list<Messaging.singleEmailMessage> emails = new list<Messaging.singleEmailMessage>();
        for(Contact myContact:myContacts){
            system.debug('myContact----'+myContact);
            system.debug('myContact.Email---'+myContact.Email);
            Messaging.singleEmailMessage email = new Messaging.singleEmailMessage();
            string[] toAddress= new string[]{myContact.Email};
            email.setToAddresses(toAddress);
            
            email.setSubject('Happy BirthDay '+myContact.Name);
            email.setSenderDisplayName('Admin');
            email.setPlainTextBody('Dear '+myContact.Name+'\n\nwishing you very Happy birthday! \n\n Regards,\n Your company');
            emails.add(email);
        }
        if(!emails.isEmpty()){
            try{
                system.debug('emails----'+emails);
                Messaging.sendEmail(emails);
            }catch(Exception e){
                eventMessages.add('Unable to send Emails to Contacts '+e.getMessage());
                system.debug('Success-----'+e.getMessage());
            }
        }
    }
    public void finish(Database.BatchableContext bc){
        AsyncApexJob myasync=[SELECT id,status,NumberOfErrors,createdby.email,JobItemsProcessed from AsyncApexJob where id=:bc.getJobId()];
        Messaging.singleEmailMessage email = new Messaging.singleEmailMessage();
        string[] toAddress = new string[]{myasync.createdby.email};
        email.setToAddresses(toAddress);
        email.setSubject('SendBirthDayBatch '+myasync.status);
        email.setPlainTextBody('The job has processed '+myasync.JobItemsProcessed+' Emails with '+myasync.NumberOfErrors+' NumberOfErrors.');
        email.setSenderDisplayName('Admin');
        Messaging.sendEmail(new Messaging.singleEmailMessage[]{email});
    }
}