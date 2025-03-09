trigger sumOpponAccount on Opportunity (after insert,after update,After delete,after undelete) {
    set<Id> accountIds= new set<Id>();
    if(Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete){
        for(Opportunity opp:Trigger.new){
            accountIds.add(opp.AccountId);
        }
        
    }
    if(Trigger.isDelete){
        for(Opportunity opp:Trigger.old){
            accountIds.add(opp.AccountId);
        }
    }
    if(!accountIds.isEmpty()){
        
    }
}