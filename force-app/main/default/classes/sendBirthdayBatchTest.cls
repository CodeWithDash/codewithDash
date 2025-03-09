@isTest
public class sendBirthdayBatchTes{
    @TestSetup
    static void makeData(){
        Contact con = new Contact();
        con.Lastname='Golcuman';
        con.Birthdate=date.today();
        insert con;
    }
    
}