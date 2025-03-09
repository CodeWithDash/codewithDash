trigger updateOppFromAccount on Account (after insert) {
    list<Opportunity> opplist = new list<opportunity>();
    Map<id,Opportunity> optyMap = new Map<id,Opportunity>([select id,AccountId,createddate from Opportunity where AccountId=:Trigger.newMap.keySet()]);
    DateTime opportunity30Days=system.now() - 30;
    for(Opportunity opty:optyMap.values()){
        if(opty.createddate < opportunity30Days && opty.stageName !='Closed Won'){
            opty.stageName='Closed Lost';
            opplist.add(opty);
        }
    }
    if(!opplist.isEmpty()){
        update opplist;
    }
}