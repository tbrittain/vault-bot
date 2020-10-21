import org.gephi.io.importer.api.ImportController;
import org.gephi.io.importer.plugin.database.EdgeListDatabaseImpl;
import org.gephi.project.api.ProjectController;
import org.gephi.project.api.Workspace;
import org.openide.util.Lookup;
import io.github.cdimascio.dotenv.*;


// This class requires Gephi Toolkit
// https://gephi.org/toolkit/
// https://www.slideshare.net/gephi/gephi-toolkit-tutorialtoolkit
// see slide 9 for edge/node import from RDBMS

public class networkViz{
    public static void main(String[] args){
        // init workspace
        ProjectController pc = Lookup.getDefault().lookup(ProjectController.class);
        pc.newProject();
        Workspace workspace = pc.getCurrentWorkspace();

        // import environment variables
        Dotenv dotenv = Dotenv.configure()
                .directory("D:/Github/vault-bot")
                .filename(".env")
                .load();

        String db_user = dotenv.get("DB_USER");
        System.out.println(db_user);

        // import test .gefx file
        ImportController importController = Lookup.getDefault().lookup(ImportController.class);
        EdgeListDatabaseImpl db = new EdgeListDatabaseImpl();


    }
}
