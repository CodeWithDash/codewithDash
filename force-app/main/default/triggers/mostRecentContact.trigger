trigger mostRecentContact on Contact (after insert,after update,after delete,after undelete) {
    set<Id> accountIds= new set<Id>();
    if(Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete){
        for(Contact con:Trigger.new){
            accountIds.add(con.AccountId);
        }
    }
    if(Trigger.isDelete){
        for(Contact con:Trigger.old){
            accountIds.add(con.AccountId);
        }
    }
    Map<id,Contact> mostrecentContact = new Map<Id,contact>();
    if(!accountIds.isEmpty()){
        list<Contact> conlist = [select id,createddate,AccountId from contact where AccountId=:accountids order by AccountId,createddate desc];
        for(contact con:conlist){
            if(!mostrecentContact.containsKey(con.AccountId)){
                mostrecentContact.put(con.AccountId,con);
            }
        }
    }
    list<account> accntsUpdate = new List<Account>();
    for(Contact conts:mostrecentContact.values()){
        Account acc = new Account(id=conts.AccountId,Most_Recent_Contact__c=mostrecentContact.get(conts.AccountId).id);
        accntsUpdate.add(acc);
    }
    if(!accntsUpdate.isEmpty()){
        update accntsUpdate;
    }
    
}