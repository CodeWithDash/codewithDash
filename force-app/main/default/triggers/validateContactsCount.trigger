trigger validateContactsCount on Contact (before insert,before update) {
    set<Id> accIds = new set<Id>();
    Map<Id,Integer> contactCountMap = new Map<Id,Integer>();
    if(Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)){
        for(Contact con:Trigger.new){
            accIds.add(con.AccountId);
        }
    }
    if(!accIds.isEmpty())
    {
        list<AggregateResult> aggrList = [Select AccountId,count(Id) contactcount from Contact where AccountId=:accIds group by AccountId];
        if(!aggrList.isEmpty()){ //Query records returns empty list. it does not return null.
            for(AggregateResult aggr:aggrList){
                contactCountMap.put((Id)aggr.get('AccountId'),(Integer)aggr.get('contactcount'));
            }
        }
    }
    for(Contact con:Trigger.new){
        if(con.AccountId != null && contactCountMap.get(con.AccountId) && contactCountMap.get(con.AccountId) >= 2){
            con.addError('You can not insert this contact as there are already two contacts on this Account');
        }
    }
}